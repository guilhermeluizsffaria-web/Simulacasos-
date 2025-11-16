import React, { useState } from 'react';
import { Skill, SkillChallenge, SkillFeedback } from '../types';
import { CheckCircleIcon, XCircleIcon } from './icons/Icons';

interface SkillTrainerScreenProps {
    skill: Skill;
    challenge: SkillChallenge;
    feedback: SkillFeedback | null;
    onEvaluate: (userAnswer: string) => void;
    onNext: () => void;
    loading: boolean;
}

const SkillTrainerScreen: React.FC<SkillTrainerScreenProps> = ({ skill, challenge, feedback, onEvaluate, onNext, loading }) => {
    const [userAnswer, setUserAnswer] = useState('');

    const handleSubmit = () => {
        if (!userAnswer.trim() || loading) return;
        onEvaluate(userAnswer);
    };

    const handleNext = () => {
        setUserAnswer('');
        onNext();
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center animate-fade-in p-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                Treino de Habilidade
            </h1>
            <h2 className="text-xl text-slate-400 mb-8">{skill}</h2>

            <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-sky-400 mb-2">Desafio:</h3>
                    <p className="text-slate-200 whitespace-pre-wrap">{challenge.challengeText}</p>
                </div>

                {!feedback && (
                     <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-2">Sua Resposta:</h3>
                        <textarea
                            className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            rows={4}
                            placeholder="Descreva sua interpretação e/ou conduta..."
                            value={userAnswer}
                            onChange={e => setUserAnswer(e.target.value)}
                            disabled={loading}
                        />
                     </div>
                )}

                {feedback && (
                    <div className={`p-4 rounded-lg border ${feedback.isCorrect ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
                         <h3 className={`text-lg font-bold flex items-center gap-2 ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {feedback.isCorrect ? <CheckCircleIcon className="w-6 h-6"/> : <XCircleIcon className="w-6 h-6"/>}
                            {feedback.isCorrect ? 'Resposta Correta' : 'Resposta Incorreta'}
                        </h3>
                        <p className="mt-2 text-slate-300">{feedback.explanation}</p>
                    </div>
                )}
            </div>
            
            <div className="mt-6 w-full">
                {feedback ? (
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg transition disabled:bg-slate-600"
                    >
                         {loading ? 'Gerando...' : 'Próximo Desafio'}
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !userAnswer.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition disabled:bg-slate-600"
                    >
                        {loading ? 'Avaliando...' : 'Verificar Resposta'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SkillTrainerScreen;
