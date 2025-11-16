import React, { useState, useRef, useEffect } from 'react';
import { ClinicalCase, UserAction, VitalSigns } from '../types';
import * as geminiService from '../services/geminiService';
import { ClipboardIcon, HeartIcon, LungsIcon, BrainIcon, BeakerIcon, FilmIcon, PlusIcon, PaperAirplaneIcon } from './icons/Icons';

interface CaseScreenProps {
  clinicalCase: ClinicalCase;
  actions: UserAction[];
  setActions: React.Dispatch<React.SetStateAction<UserAction[]>>;
  onFinishCase: (finalActions: UserAction[]) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const VitalSign: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/50 text-center">
        <div className="flex items-center gap-1 text-slate-400 text-sm">{icon}{label}</div>
        <div className="text-lg font-bold text-white">{value}</div>
    </div>
);

const CaseScreen: React.FC<CaseScreenProps> = ({ clinicalCase, actions, setActions, onFinishCase, loading, setLoading, error, setError }) => {
  const [userInput, setUserInput] = useState('');
  const [currentActionType, setCurrentActionType] = useState<UserAction['type'] | null>(null);
  const [hypotheses, setHypotheses] = useState('');
  const [conduct, setConduct] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actions]);

  const handleActionSubmit = async () => {
    if (!userInput.trim() || !currentActionType || loading) return;
    
    setLoading(true);
    setError(null);
    const newAction: UserAction = { type: currentActionType, query: userInput };
    setActions(prev => [...prev, newAction]);
    setUserInput('');

    try {
      const response = await geminiService.getInteractionResponse(clinicalCase, actions, `${currentActionType}: ${userInput}`);
      setActions(prev => prev.map((action, index) => 
        index === prev.length - 1 ? { ...action, response } : action
      ));
    } catch (e) {
      console.error(e);
      setError('Falha ao obter resposta da IA. Tente novamente.');
      setActions(prev => prev.slice(0, -1)); // Remove the action that failed
    } finally {
      setLoading(false);
      setCurrentActionType(null);
    }
  };

  const handleFinish = () => {
      const finalActions: UserAction[] = [
          { type: 'Hipóteses', query: hypotheses },
          { type: 'Conduta', query: conduct }
      ];
      onFinishCase(finalActions);
  }

  const actionButtons: { type: UserAction['type']; label: string; icon: React.ReactNode }[] = [
      { type: 'Anamnese', label: 'Anamnese', icon: <ClipboardIcon className="w-5 h-5" /> },
      { type: 'Exame Físico', label: 'Ex. Físico', icon: <HeartIcon className="w-5 h-5" /> },
      { type: 'Exames', label: 'Exames', icon: <BeakerIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-2 animate-fade-in">
      {/* Patient Info Column */}
      <div className="lg:col-span-1 bg-slate-800/50 rounded-xl shadow-lg p-6 flex flex-col border border-slate-700 h-full max-h-[85vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-sky-400 border-b border-slate-600 pb-2">Ficha do Paciente</h2>
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-slate-400">Identificação</h3>
                <p className="text-lg">{clinicalCase.patientInfo}</p>
            </div>
            <div>
                <h3 className="font-semibold text-slate-400">Queixa Principal</h3>
                <p className="text-lg">{clinicalCase.initialComplaint}</p>
            </div>
            <div>
                <h3 className="font-semibold text-slate-400 mb-2">Sinais Vitais</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <VitalSign label="FC" value={clinicalCase.vitalSigns.fc} icon={<HeartIcon className="w-4 h-4" />} />
                    <VitalSign label="FR" value={clinicalCase.vitalSigns.fr} icon={<LungsIcon className="w-4 h-4" />} />
                    <VitalSign label="PA" value={clinicalCase.vitalSigns.pa} icon={<span className="font-bold text-xs">PA</span>} />
                    <VitalSign label="T" value={clinicalCase.vitalSigns.temp} icon={<span className="font-bold text-xs">T°</span>} />
                    <VitalSign label="SatO₂" value={clinicalCase.vitalSigns.satO2} icon={<span className="font-bold text-xs">O₂</span>} />
                    {clinicalCase.vitalSigns.glicemia && <VitalSign label="Glic." value={clinicalCase.vitalSigns.glicemia} icon={<BeakerIcon className="w-4 h-4" />} />}
                </div>
            </div>
        </div>
      </div>

      {/* Interaction Column */}
      <div className="lg:col-span-2 bg-slate-800/50 rounded-xl shadow-lg flex flex-col border border-slate-700 h-full max-h-[85vh]">
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="space-y-6">
            {actions.map((action, index) => (
              <div key={index}>
                <div className="flex justify-end">
                  <div className="bg-sky-600 p-3 rounded-lg max-w-lg">
                    <p className="font-bold text-sky-200 text-sm mb-1">{action.type}</p>
                    <p>{action.query}</p>
                  </div>
                </div>
                <div className="flex justify-start mt-2">
                    <div className="bg-slate-700 p-3 rounded-lg max-w-lg">
                    {action.response ? <p className="whitespace-pre-wrap">{action.response}</p> : <p className="text-slate-400 italic">Aguardando resposta...</p>}
                    </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
        {error && <p className="text-red-400 text-center text-sm p-2">{error}</p>}
        <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl space-y-4">
          {currentActionType ? (
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-grow bg-slate-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    placeholder={`Perguntar sobre ${currentActionType}...`}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleActionSubmit()}
                    autoFocus
                    disabled={loading}
                />
                <button onClick={handleActionSubmit} disabled={loading || !userInput.trim()} className="bg-sky-600 hover:bg-sky-500 text-white p-3 rounded-lg disabled:bg-slate-600">
                    <PaperAirplaneIcon className="w-6 h-6"/>
                </button>
                 <button onClick={() => setCurrentActionType(null)} className="bg-slate-600 hover:bg-slate-500 text-white p-3 rounded-lg">
                    X
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {actionButtons.map(btn => (
                <button 
                  key={btn.type}
                  onClick={() => setCurrentActionType(btn.type)} 
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold p-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </div>
          )}
           <div className="pt-4 border-t border-slate-700">
                <h3 className="text-lg font-bold mb-2 text-amber-400">Definir Conduta Final</h3>
                <textarea
                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 mb-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    rows={2}
                    placeholder="Liste suas hipóteses diagnósticas aqui..."
                    value={hypotheses}
                    onChange={e => setHypotheses(e.target.value)}
                    disabled={loading}
                />
                <textarea
                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 mb-4 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    rows={3}
                    placeholder="Descreva sua conduta final (medicações, internação, alta, etc.)..."
                    value={conduct}
                    onChange={e => setConduct(e.target.value)}
                    disabled={loading}
                />
                <button
                    onClick={handleFinish}
                    disabled={loading || !hypotheses || !conduct}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {loading ? 'Finalizando...' : 'Finalizar Atendimento'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CaseScreen;
