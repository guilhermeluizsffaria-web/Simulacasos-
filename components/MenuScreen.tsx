import React, { useState } from 'react';
import { Scenario, Difficulty, GameMode, Skill, ScenarioID } from '../types';
import { HospitalIcon, ClinicIcon, AmbulanceIcon, LockClosedIcon, StethoscopeIcon, TargetIcon, EcgIcon, XrayIcon } from './icons/Icons';

interface MenuScreenProps {
  onStartCase: (scenario: Scenario, difficulty: Difficulty) => void;
  onStartSkill: (skill: Skill) => void;
  loading: boolean;
  userLevel: number;
}

const scenarioDetails: Scenario[] = [
    { id: ScenarioID.UPA, label: "UPA / Pronto Atendimento", description: "Casos de complexidade intermediária.", icon: <AmbulanceIcon className="w-8 h-8 text-amber-400" />, requiredLevel: 1 },
    { id: ScenarioID.UBS, label: "Demanda Espontânea de UBS", description: "Casos de baixa complexidade e atenção primária.", icon: <ClinicIcon className="w-8 h-8 text-sky-400" />, requiredLevel: 1 },
    { id: ScenarioID.HOSPITAL, label: "P.S. de Alta Complexidade", description: "Casos graves e desafiadores.", icon: <HospitalIcon className="w-8 h-8 text-rose-400" />, requiredLevel: 3 },
    { id: ScenarioID.UTI, label: "UTI", description: "Manejo de pacientes críticos.", icon: <StethoscopeIcon className="w-8 h-8 text-fuchsia-400" />, requiredLevel: 5 },
    { id: ScenarioID.SURGERY, label: "Centro Cirúrgico", description: "Emergências cirúrgicas.", icon: <StethoscopeIcon className="w-8 h-8 text-indigo-400" />, requiredLevel: 8 },
]

const skillDetails = [
    { id: Skill.ECG, label: Skill.ECG, icon: <EcgIcon className="w-8 h-8 text-green-400" /> },
    { id: Skill.XRAY_CHEST, label: Skill.XRAY_CHEST, icon: <XrayIcon className="w-8 h-8 text-blue-400" /> },
    { id: Skill.HYPERTENSIVE_CRISIS, label: Skill.HYPERTENSIVE_CRISIS, icon: <TargetIcon className="w-8 h-8 text-red-400" /> },
]

const MenuScreen: React.FC<MenuScreenProps> = ({ onStartCase, onStartSkill, loading, userLevel }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarioDetails[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.INICIANTE);

  const difficultyOptions = [
    { id: Difficulty.INICIANTE, label: 'Iniciante', color: 'bg-green-500' },
    { id: Difficulty.INTERMEDIARIO, label: 'Intermediário', color: 'bg-yellow-500' },
    { id: Difficulty.AVANCADO, label: 'Avançado', color: 'bg-red-500' },
  ];
  
  const renderModeSelection = () => (
     <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
        <button onClick={() => setSelectedMode(GameMode.FULL_CASE)} className="bg-slate-800/50 p-8 rounded-2xl shadow-xl border border-slate-700 hover:border-sky-500 hover:bg-slate-800 transition-all text-left flex flex-col h-full">
            <StethoscopeIcon className="w-12 h-12 mb-4 text-sky-400" />
            <h2 className="text-2xl font-bold text-slate-100">Simulação de Caso</h2>
            <p className="text-slate-400 mt-2 flex-grow">Atenda pacientes em cenários realistas, do início ao fim. Desenvolva seu raciocínio clínico completo.</p>
        </button>
        <button onClick={() => setSelectedMode(GameMode.SKILL_TRAINING)} className="bg-slate-800/50 p-8 rounded-2xl shadow-xl border border-slate-700 hover:border-amber-500 hover:bg-slate-800 transition-all text-left flex flex-col h-full">
            <TargetIcon className="w-12 h-12 mb-4 text-amber-400" />
            <h2 className="text-2xl font-bold text-slate-100">Treino de Habilidades</h2>
            <p className="text-slate-400 mt-2 flex-grow">Pratique desafios rápidos e focados, como interpretação de ECG, Raio-X e manejo de condições específicas.</p>
        </button>
     </div>
  );
  
  const renderFullCaseSetup = () => (
     <div className="w-full max-w-md bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-6 text-slate-200">Novo Caso Clínico</h2>
        <div className="mb-6">
          <label className="block text-left text-sm font-medium text-slate-400 mb-2">Selecione o Cenário</label>
          <div className="space-y-3">
            {scenarioDetails.map(opt => {
                const isLocked = userLevel < opt.requiredLevel;
                return (
                  <button
                    key={opt.id}
                    onClick={() => !isLocked && setSelectedScenario(opt)}
                    disabled={isLocked}
                    className={`w-full flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${selectedScenario.id === opt.id && !isLocked ? 'bg-slate-700 border-sky-500' : 'bg-slate-900 border-slate-700'} ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:border-slate-500'}`}
                  >
                    {opt.icon}
                    <div className="text-left">
                        <span className="font-semibold">{opt.label}</span>
                         {isLocked && <p className="text-xs text-slate-400 flex items-center gap-1"><LockClosedIcon className="w-3 h-3"/> Nível {opt.requiredLevel} necessário</p>}
                    </div>
                  </button>
                )
            })}
          </div>
        </div>
        <div className="mb-8">
          <label className="block text-left text-sm font-medium text-slate-400 mb-2">Nível de Dificuldade</label>
          <div className="grid grid-cols-3 gap-3">
             {difficultyOptions.map(opt => (
                <button key={opt.id} onClick={() => setDifficulty(opt.id)} className={`p-3 rounded-lg text-sm font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${difficulty === opt.id ? `${opt.color} text-white shadow-lg` : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {opt.label}
                </button>
             ))}
          </div>
        </div>
        <button onClick={() => onStartCase(selectedScenario, difficulty)} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg">
          {loading ? 'Gerando caso...' : 'Iniciar Atendimento'}
        </button>
      </div>
  );

  const renderSkillTrainingSetup = () => (
     <div className="w-full max-w-md bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-6 text-slate-200">Treinar Habilidade</h2>
        <div className="space-y-3">
            {skillDetails.map(skill => (
                <button
                    key={skill.id}
                    onClick={() => onStartSkill(skill.id)}
                    disabled={loading}
                    className="w-full flex items-center p-4 rounded-lg border-2 transition-all duration-200 bg-slate-900 border-slate-700 hover:border-amber-500 disabled:opacity-50"
                >
                    {skill.icon}
                    <span className="font-semibold">{skill.label}</span>
                     {loading && <svg className="animate-spin ml-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                </button>
            ))}
        </div>
     </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
        {selectedMode && (
            <button onClick={() => setSelectedMode(null)} className="absolute top-28 left-4 bg-slate-700/50 hover:bg-slate-600/50 text-xs text-slate-300 font-semibold py-1 px-3 rounded-full flex items-center gap-2 transition">
                &larr; Voltar
            </button>
        )}
      <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">
        Pronto Socorro Sim
      </h1>
      <p className="text-lg text-slate-400 mb-10 max-w-2xl">
        {selectedMode === null && "Escolha um modo de jogo para começar seu treinamento."}
        {selectedMode === GameMode.FULL_CASE && "Configure os detalhes do seu próximo atendimento."}
        {selectedMode === GameMode.SKILL_TRAINING && "Escolha uma habilidade para praticar."}
      </p>

      {!selectedMode && renderModeSelection()}
      {selectedMode === GameMode.FULL_CASE && renderFullCaseSetup()}
      {selectedMode === GameMode.SKILL_TRAINING && renderSkillTrainingSetup()}
    </div>
  );
};

export default MenuScreen;
