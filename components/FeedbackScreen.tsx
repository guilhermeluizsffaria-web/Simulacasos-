
import React from 'react';
import { Feedback, Scores } from '../types';
import { CheckCircleIcon, XCircleIcon, BookOpenIcon, StarIcon } from './icons/Icons';

interface FeedbackScreenProps {
  feedback: Feedback;
  onNewCase: () => void;
}

const ScoreBar: React.FC<{ score: number, label: string }> = ({ score, label }) => {
  const getScoreColor = (s: number) => {
    if (s < 40) return 'bg-red-500';
    if (s < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${getScoreColor(score).replace('bg-', 'text-')}`}>{score}/100</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div className={`${getScoreColor(score)} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
};

const FeedbackCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <div className="text-slate-300 space-y-2 prose prose-invert prose-sm max-w-none prose-li:my-1">{children}</div>
    </div>
);


const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ feedback, onNewCase }) => {

  const parseMarkdownList = (text: string) => {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {text.split('\n').map((item, index) => item.trim().startsWith('* ') || item.trim().startsWith('- ') ? <li key={index}>{item.substring(2)}</li> : null).filter(Boolean)}
      </ul>
    );
  }

  const overallScore = Math.round((feedback.scores.diagnosticReasoning + feedback.scores.examRequests + feedback.scores.patientSafety + feedback.scores.finalConduct) / 4);

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Feedback do Caso
        </h1>
        <p className="text-slate-400 mt-2">Análise detalhada da sua performance.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6 text-center">
        <h2 className="text-lg font-semibold text-slate-400 mb-2">Pontuação Geral</h2>
        <p className="text-6xl font-bold text-amber-400">{overallScore}<span className="text-3xl text-slate-400">/100</span></p>
        <p className="mt-2 text-slate-300">Diagnóstico final mais provável: <span className="font-bold">{feedback.finalDiagnosis}</span></p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 md:col-span-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><StarIcon className="w-6 h-6 text-yellow-400"/>Desempenho por Eixo</h3>
            <div className="space-y-4">
                <ScoreBar score={feedback.scores.diagnosticReasoning} label="Raciocínio Diagnóstico" />
                <ScoreBar score={feedback.scores.examRequests} label="Pedidos de Exames" />
                <ScoreBar score={feedback.scores.patientSafety} label="Segurança do Paciente" />
                <ScoreBar score={feedback.scores.finalConduct} label="Conduta Final" />
            </div>
        </div>
        
        <FeedbackCard title="Acertos na Condução" icon={<CheckCircleIcon className="w-6 h-6 text-green-400"/>}>
            {parseMarkdownList(feedback.correctActions)}
        </FeedbackCard>

        <FeedbackCard title="Pontos a Melhorar" icon={<XCircleIcon className="w-6 h-6 text-red-400"/>}>
            {parseMarkdownList(feedback.inadequateActions)}
        </FeedbackCard>
        
        <div className="md:col-span-2">
            <FeedbackCard title="Diagnóstico Diferencial" icon={<BookOpenIcon className="w-6 h-6 text-sky-400"/>}>
                <p>{feedback.differentialFeedback}</p>
            </FeedbackCard>
        </div>

        <div className="md:col-span-2">
            <FeedbackCard title="Referências" icon={<BookOpenIcon className="w-6 h-6 text-sky-400"/>}>
                <p>{feedback.references}</p>
            </FeedbackCard>
        </div>

      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onNewCase}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
        >
          Iniciar Novo Caso
        </button>
      </div>
    </div>
  );
};

export default FeedbackScreen;
