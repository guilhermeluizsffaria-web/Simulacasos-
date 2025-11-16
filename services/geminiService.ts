import { GoogleGenAI, Type } from "@google/genai";
import { Scenario, Difficulty, ClinicalCase, UserAction, Feedback, Skill, SkillChallenge, SkillFeedback } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const caseGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        patientInfo: { type: Type.STRING, description: "Descrição do paciente (idade, sexo, comorbidades relevantes). Ex: 'Homem, 58 anos, hipertenso e diabético.'" },
        initialComplaint: { type: Type.STRING, description: "Queixa principal e história da doença atual de forma sucinta. Ex: 'Dor torácica em aperto há 2 horas.'" },
        vitalSigns: {
            type: Type.OBJECT,
            properties: {
                fc: { type: Type.STRING, description: "Frequência Cardíaca (bpm)" },
                fr: { type: Type.STRING, description: "Frequência Respiratória (ipm)" },
                pa: { type: Type.STRING, description: "Pressão Arterial (mmHg)" },
                temp: { type: Type.STRING, description: "Temperatura (°C)" },
                satO2: { type: Type.STRING, description: "Saturação de Oxigênio (%)" },
                glicemia: { type: Type.STRING, description: "Glicemia capilar (mg/dL)" }
            },
        },
        fullCaseDescription: { type: Type.STRING, description: "Descrição completa e detalhada do caso real, incluindo diagnóstico final, para ser usada na avaliação. Ex: 'Paciente com IAM com supra de ST em parede anterior...'" }
    },
};

const interactionResponseSchema = {
    type: Type.OBJECT,
    properties: {
        response: { type: Type.STRING, description: "A resposta concisa para a pergunta ou solicitação do usuário." }
    },
};

const feedbackGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        finalDiagnosis: { type: Type.STRING, description: "O diagnóstico final mais provável para o caso." },
        differentialFeedback: { type: Type.STRING, description: "Análise sobre os diagnósticos diferenciais que o usuário considerou ou ignorou." },
        correctActions: { type: Type.STRING, description: "Lista em markdown dos acertos do usuário na condução do caso." },
        inadequateActions: { type: Type.STRING, description: "Lista em markdown do que foi inadequado, perigoso ou desnecessário, com justificativas." },
        references: { type: Type.STRING, description: "Referência sucinta a protocolos/diretrizes relevantes. Ex: 'Conduta alinhada com a diretriz de SCA da SBC, 2021'." },
        scores: {
            type: Type.OBJECT,
            properties: {
                diagnosticReasoning: { type: Type.NUMBER, description: "Nota de 0 a 100 para o raciocínio diagnóstico." },
                examRequests: { type: Type.NUMBER, description: "Nota de 0 a 100 para a pertinência dos exames solicitados." },
                patientSafety: { type: Type.NUMBER, description: "Nota de 0 a 100 para a segurança do paciente." },
                finalConduct: { type: Type.NUMBER, description: "Nota de 0 a 100 para a conduta final." }
            }
        }
    },
};

const skillChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        challengeText: { type: Type.STRING, description: "O texto do desafio a ser apresentado ao usuário. Ex: 'ECG de 12 derivações mostra...'"},
        fullDescription: { type: Type.STRING, description: "Descrição interna detalhada do desafio e da resposta correta para avaliação. Ex: 'O diagnóstico é X e a conduta é Y por causa de Z.'"}
    }
};

const skillEvaluationSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: { type: Type.BOOLEAN, description: "A resposta do usuário foi correta ou majoritariamente correta?"},
        explanation: { type: Type.STRING, description: "Feedback conciso e educativo para o usuário, explicando por que a resposta está certa ou errada."}
    }
};


export const generateCase = async (scenario: Scenario, difficulty: Difficulty): Promise<ClinicalCase> => {
    const prompt = `Você é um simulador de casos clínicos para educação médica no Brasil.
    Gere um caso clínico realista para um médico em um cenário de "${scenario.label}".
    O nível de dificuldade deve ser "${difficulty}".
    O caso deve ser epidemiologicamente relevante para o Brasil.
    Forneça as informações do paciente, queixa inicial, sinais vitais e uma descrição completa oculta do caso para avaliação posterior.
    Siga o schema JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: caseGenerationSchema,
            temperature: 1,
        }
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse as ClinicalCase;
};

export const getInteractionResponse = async (fullCase: ClinicalCase, history: UserAction[], newUserAction: string): Promise<string> => {
    const prompt = `Simulador Médico: Você está no meio de um atendimento.
    
    Cenário Completo (diagnóstico real): ${fullCase.fullCaseDescription}
    
    Histórico do Atendimento até agora:
    ${history.map(a => `- Usuário: ${a.query}\n- Resposta: ${a.response}`).join('\n')}
    
    Nova Ação do Usuário: "${newUserAction}"
    
    Responda a esta nova ação de forma realista e concisa.
    - Se for uma pergunta de anamnese, responda como o paciente.
    - Se for um pedido de exame físico, descreva os achados.
    - Se for um pedido de exame complementar, forneça o resultado. Se o exame não estiver disponível no cenário, informe isso.
    - Seja breve e direto.
    Siga o schema JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: interactionResponseSchema,
        }
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse.response;
};


export const generateFeedback = async (clinicalCase: ClinicalCase, actions: UserAction[]): Promise<Feedback> => {
    const userHypotheses = actions.find(a => a.type === "Hipóteses")?.query || "Não informado";
    const userConduct = actions.find(a => a.type === "Conduta")?.query || "Não informado";

    const prompt = `Você é um preceptor de medicina experiente avaliando a performance de um médico recém-formado.
    
    **Caso Clínico Real:**
    ${clinicalCase.fullCaseDescription}
    
    **Transcrição completa do atendimento realizado pelo médico:**
    ${actions.filter(a => a.type !== "Hipóteses" && a.type !== "Conduta").map(a => `- ${a.type}: ${a.query}\n- Resultado: ${a.response}`).join('\n')}
    
    **Hipóteses Diagnósticas do médico:**
    ${userHypotheses}
    
    **Conduta Final definida pelo médico:**
    ${userConduct}
    
    **Sua Tarefa:**
    Avalie a condução do caso de forma estruturada. Baseie-se nas melhores evidências e diretrizes brasileiras.
    Seja crítico, justo e educativo.
    Preencha todos os campos do schema JSON com a sua avaliação.
    As notas devem refletir a performance: 100 é perfeito, 0 é péssimo.
    As seções de acertos e inadequações devem ser em formato de lista markdown.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: feedbackGenerationSchema,
        }
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse as Feedback;
};

export const generateSkillChallenge = async (skill: Skill): Promise<SkillChallenge> => {
    const prompt = `Você é um criador de desafios rápidos para treinamento médico.
    Gere um desafio focado na habilidade: "${skill}".
    O desafio deve ser um cenário curto e direto.
    - Para ECG/Raio-X: Descreva os achados de um exame de imagem/gráfico junto com uma breve vinheta clínica.
    - Para Manejo de Condições: Descreva um paciente com uma condição específica e peça a conduta imediata.
    O campo 'challengeText' é o que o usuário verá.
    O campo 'fullDescription' deve conter a resposta correta e o porquê, para ser usado na avaliação.
    Seja conciso. Siga o schema JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: skillChallengeSchema,
        }
    });

    return JSON.parse(response.text) as SkillChallenge;
};

export const evaluateSkillAttempt = async (challenge: SkillChallenge, userAnswer: string): Promise<SkillFeedback> => {
    const prompt = `Você é um preceptor médico avaliando uma resposta rápida.
    
    **Contexto do Desafio e Resposta Correta:** 
    ${challenge.fullDescription}
    
    **Resposta do Usuário:**
    "${userAnswer}"
    
    **Sua Tarefa:**
    Avalie se a resposta do usuário está correta.
    Forneça uma explicação curta e direta. O objetivo é o feedback imediato.
    Siga o schema JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: skillEvaluationSchema,
        }
    });

    return JSON.parse(response.text) as SkillFeedback;
};
