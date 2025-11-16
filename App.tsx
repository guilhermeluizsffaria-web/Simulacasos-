import React, { useState, useCallback } from 'react';
import { GameState, Scenario, Difficulty, ClinicalCase, UserAction, Feedback, PerformanceHistory, Skill, SkillChallenge, SkillFeedback } from './types';
import MenuScreen from './components/MenuScreen';
import CaseScreen from './components/CaseScreen';
import FeedbackScreen from './components/FeedbackScreen';
import SkillTrainerScreen from './components/SkillTrainerScreen';
import * as geminiService from './services/geminiService';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import HistoryScreen from './components/HistoryScreen';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentCase, setCurrentCase] = useState<ClinicalCase | null>(null);
  const [actions, setActions] = useState<UserAction[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [skillChallenge, setSkillChallenge] = useState<SkillChallenge | null>(null);
  const [skillFeedback, setSkillFeedback] = useState<SkillFeedback | null>(null);


  const [history, setHistory] = useState<PerformanceHistory>({
    totalCases: 0,
    correctDiagnoses: 0,
    averageScore: 0,
    scoresByArea: {
      diagnosticReasoning: [],
      examRequests: [],
      patientSafety: [],
      finalConduct: [],
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  
  const resetToMenu = useCallback(() => {
    setGameState(GameState.MENU);
    setCurrentCase(null);
    setActions([]);
    setFeedback(null);
    setSkillChallenge(null);
    setSkillFeedback(null);
    setCurrentSkill(null);
    setShowHistory(false);
    setError(null);
  }, []);

  const handleStartCase = useCallback(async (scenario: Scenario, difficulty: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const newCase = await geminiService.generateCase(scenario, difficulty);
      setCurrentCase(newCase);
      setActions([]);
      setFeedback(null);
      setGameState(GameState.IN_CASE);
    } catch (e) {
      setError('Falha ao gerar o caso clínico. Tente novamente.');
      console.error(e);
      setGameState(GameState.MENU);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartSkillTraining = useCallback(async (skill: Skill) => {
    setLoading(true);
    setError(null);
    setSkillFeedback(null);
    setCurrentSkill(skill);
    try {
      const newChallenge = await geminiService.generateSkillChallenge(skill);
      setSkillChallenge(newChallenge);
      setGameState(GameState.SKILL_TRAINING);
    } catch (e) {
      setError('Falha ao gerar o desafio. Tente novamente.');
      console.error(e);
      setGameState(GameState.MENU);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEvaluateSkill = useCallback(async (userAnswer: string) => {
    if (!skillChallenge) return;
    setLoading(true);
    setError(null);
    try {
      const feedback = await geminiService.evaluateSkillAttempt(skillChallenge, userAnswer);
      setSkillFeedback(feedback);
    } catch(e) {
      setError('Falha ao avaliar a resposta. Tente novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [skillChallenge]);

  const handleFinishCase = useCallback(async (finalActions: UserAction[]) => {
    if (!currentCase) return;
    setLoading(true);
    setError(null);
    const fullHistory = [...actions, ...finalActions];
    setActions(fullHistory);

    try {
      const caseFeedback = await geminiService.generateFeedback(currentCase, fullHistory);
      setFeedback(caseFeedback);

      const totalScore = (caseFeedback.scores.diagnosticReasoning + caseFeedback.scores.examRequests + caseFeedback.scores.patientSafety + caseFeedback.scores.finalConduct);
      const earnedXp = Math.round(totalScore / 4);
      const newXp = xp + earnedXp;
      setXp(newXp);
      setLevel(Math.floor(newXp / 100) + 1);
      
      const isCorrectDiagnosis = caseFeedback.scores.diagnosticReasoning > 80;

      setHistory(prev => {
        const newTotalCases = prev.totalCases + 1;
        const newAverageScore = ((prev.averageScore * prev.totalCases) + (totalScore / 4)) / newTotalCases;
        return {
          totalCases: newTotalCases,
          correctDiagnoses: prev.correctDiagnoses + (isCorrectDiagnosis ? 1 : 0),
          averageScore: newAverageScore,
          scoresByArea: {
            diagnosticReasoning: [...prev.scoresByArea.diagnosticReasoning, caseFeedback.scores.diagnosticReasoning],
            examRequests: [...prev.scoresByArea.examRequests, caseFeedback.scores.examRequests],
            patientSafety: [...prev.scoresByArea.patientSafety, caseFeedback.scores.patientSafety],
            finalConduct: [...prev.scoresByArea.finalConduct, caseFeedback.scores.finalConduct],
          }
        }
      });

      setGameState(GameState.FEEDBACK);
    } catch (e) {
      setError('Falha ao gerar o feedback. Por favor, tente finalizar o caso novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentCase, actions, xp]);

  const renderContent = () => {
    if (showHistory) {
      return <HistoryScreen history={history} onBack={() => setShowHistory(false)} />;
    }

    switch (gameState) {
      case GameState.IN_CASE:
        return currentCase ? (
          <CaseScreen
            clinicalCase={currentCase}
            actions={actions}
            setActions={setActions}
            onFinishCase={handleFinishCase}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
          />
        ) : null;
      case GameState.FEEDBACK:
        return feedback ? <FeedbackScreen feedback={feedback} onNewCase={resetToMenu} /> : null;
      case GameState.SKILL_TRAINING:
        return skillChallenge && currentSkill ? (
          <SkillTrainerScreen 
            challenge={skillChallenge}
            skill={currentSkill}
            feedback={skillFeedback}
            onEvaluate={handleEvaluateSkill}
            onNext={() => handleStartSkillTraining(currentSkill)}
            loading={loading}
          />
        ) : null;
      case GameState.MENU:
      default:
        return <MenuScreen 
          onStartCase={handleStartCase} 
          onStartSkill={handleStartSkillTraining}
          loading={loading}
          userLevel={level}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      <Header 
        xp={xp} 
        level={level} 
        onShowHistory={() => setShowHistory(true)} 
        isHistoryVisible={showHistory}
        onBackToMenu={gameState !== GameState.MENU ? resetToMenu : undefined}
      />
      <main className="flex-grow container mx-auto p-4 flex flex-col">
        {renderContent()}
      </main>
      <footer className="p-4 text-center text-xs text-slate-500">
        <Disclaimer />
      </footer>
    </div>
  );
}