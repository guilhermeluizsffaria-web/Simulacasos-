import React from 'react';
import { PerformanceHistory } from '../types';
import { ChartBarIcon, CheckCircleIcon, StarIcon, ArrowLeftIcon } from './icons/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoryScreenProps {
  history: PerformanceHistory;
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack }) => {

    const averageScores = [
        { name: 'Raciocínio Diag.', Média: history.scoresByArea.diagnosticReasoning.reduce((a, b) => a + b, 0) / (history.scoresByArea.diagnosticReasoning.length || 1) },
        { name: 'Exames', Média: history.scoresByArea.examRequests.reduce((a, b) => a + b, 0) / (history.scoresByArea.examRequests.length || 1) },
        { name: 'Segurança', Média: history.scoresByArea.patientSafety.reduce((a, b) => a + b, 0) / (history.scoresByArea.patientSafety.length || 1) },
        { name: 'Conduta', Média: history.scoresByArea.finalConduct.reduce((a, b) => a + b, 0) / (history.scoresByArea.finalConduct.length || 1) },
    ];
    
    const correctDiagnosisRate = history.totalCases > 0 ? (history.correctDiagnoses / history.totalCases) * 100 : 0;

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in p-4">
             <div className="flex items-center mb-8">
                <button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-full mr-4 transition">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                    Histórico de Desempenho
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                    <h3 className="text-lg font-semibold text-slate-400">Casos Resolvidos</h3>
                    <p className="text-4xl font-bold text-white mt-2">{history.totalCases}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                    <h3 className="text-lg font-semibold text-slate-400">Pontuação Média</h3>
                    <p className="text-4xl font-bold text-amber-400 mt-2">{history.averageScore.toFixed(0)}</p>
                </div>
                 <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
                    <h3 className="text-lg font-semibold text-slate-400">Taxa de Acerto Diag.</h3>
                    <p className="text-4xl font-bold text-green-400 mt-2">{correctDiagnosisRate.toFixed(0)}%</p>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 text-slate-200 flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6" />
                    Pontuação Média por Área
                </h2>
                 {history.totalCases > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={averageScores} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '0.5rem'
                                    }}
                                    labelStyle={{ color: '#cbd5e1' }}
                                />
                                <Legend />
                                <Bar dataKey="Média" fill="#22c55e" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-12">Complete um caso para ver suas estatísticas.</p>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;