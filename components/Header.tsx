import React from 'react';
import { ChartBarIcon, StarIcon, ArrowLeftIcon } from './icons/Icons';

interface HeaderProps {
  xp: number;
  level: number;
  onShowHistory: () => void;
  isHistoryVisible: boolean;
  onBackToMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({ xp, level, onShowHistory, isHistoryVisible, onBackToMenu }) => {
  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = xp - ((level - 1) * 100);
  const progressPercentage = (xpInCurrentLevel / 100) * 100;

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
            {onBackToMenu && (
                 <button 
                    onClick={onBackToMenu}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-full transition"
                    title="Voltar ao Menu"
                 >
                     <ArrowLeftIcon className="w-5 h-5" />
                 </button>
            )}
            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                P.S. Sim
            </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 w-40 md:w-64">
                <div className="flex items-center justify-center bg-yellow-400/10 text-yellow-300 rounded-full w-10 h-10 border-2 border-yellow-400/30 flex-shrink-0">
                  <StarIcon className="w-5 h-5"/>
                  <span className="font-bold text-sm">{level}</span>
                </div>
                <div className="w-full hidden md:block">
                    <div className="text-xs text-slate-400 mb-1">XP: {xp} / {xpForNextLevel}</div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>
            {!isHistoryVisible && (
              <button 
                onClick={onShowHistory}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-3 rounded-lg flex items-center gap-2 transition"
                title="Ver Histórico de Desempenho"
              >
                  <ChartBarIcon className="w-5 h-5" />
                  <span className="hidden md:inline">Histórico</span>
              </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;