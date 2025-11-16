import { ReactNode } from "react";

export enum GameState {
  MENU,
  IN_CASE,
  FEEDBACK,
  SKILL_TRAINING,
}

export enum ScenarioID {
  UPA = "UPA",
  UBS = "UBS",
  HOSPITAL = "HOSPITAL",
  UTI = "UTI",
  SURGERY = "CENTRO_CIRURGICO",
}

export interface Scenario {
  id: ScenarioID;
  label: string;
  description: string;
  icon: ReactNode;
  requiredLevel: number;
}


export enum Difficulty {
  INICIANTE = "Iniciante",
  INTERMEDIARIO = "Intermediário",
  AVANCADO = "Avançado",
}

export enum GameMode {
  FULL_CASE = "Simulação de Caso Completo",
  SKILL_TRAINING = "Treino de Habilidades"
}

export enum Skill {
  ECG = "Interpretação de ECG",
  XRAY_CHEST = "Análise de Raio-X de Tórax",
  HYPERTENSIVE_CRISIS = "Manejo de Crise Hipertensiva",
}

export interface SkillChallenge {
  challengeText: string;
  fullDescription: string; // Internal description with the correct answer for evaluation
}

export interface SkillFeedback {
  isCorrect: boolean;
  explanation: string;
}


export interface VitalSigns {
  fc: string; // Frequência Cardíaca
  fr: string; // Frequência Respiratória
  pa: string; // Pressão Arterial
  temp: string; // Temperatura
  satO2: string; // Saturação de O₂
  glicemia?: string; // Glicemia capilar
}

export interface ClinicalCase {
  patientInfo: string;
  initialComplaint: string;
  vitalSigns: VitalSigns;
  fullCaseDescription: string; // Hidden full description for feedback generation
}

export interface UserAction {
  type: "Anamnese" | "Exame Físico" | "Exames" | "Hipóteses" | "Conduta";
  query: string;
  response?: string;
}

export interface Scores {
  diagnosticReasoning: number;
  examRequests: number;
  patientSafety: number;
  finalConduct: number;
}

export interface Feedback {
  finalDiagnosis: string;
  differentialFeedback: string;
  correctActions: string;
  inadequateActions: string;
  references: string;
  scores: Scores;
}

export interface PerformanceHistory {
  totalCases: number;
  correctDiagnoses: number;
  averageScore: number;
  scoresByArea: {
      diagnosticReasoning: number[];
      examRequests: number[];
      patientSafety: number[];
      finalConduct: number[];
  }
}