import { useState, useEffect, useCallback, useRef } from 'react';
import { BREAK_WRONG_THRESHOLD, HELP_OVERTIME_SECONDS, CORRECT_FEEDBACK_DELAY_MS, INCORRECT_FEEDBACK_DELAY_MS, DEFAULT_GAME_MODE } from './utils/constants';

// Hooks
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { useGameSession } from './hooks/useGameSession';

// Services
import { generateQuestion } from './services/questionGenerator';

// Components
import MenuScreen from './components/menu/MenuScreen';
import CustomSetup from './components/menu/CustomSetup';
import GameScreen from './components/game/GameScreen';
import FinishedScreen from './components/results/FinishedScreen';
import StatsScreen from './components/stats/StatsScreen';

// Types
import { Question, Attempt, CustomConfig, GameMode } from './types';

function App() {
  // Game State
  const [gameState, setGameState] = useState<string>('menu');
  const [difficulty, setDifficulty] = useState<number | number | CustomConfig>(20);
  const [customConfig, setCustomConfig] = useState<CustomConfig>({ max: 50, ops: ['+', '-', '*', '/'] });
  const [gameMode, setGameMode] = useState<GameMode>(DEFAULT_GAME_MODE as GameMode);
  // Store mode when going to custom setup
  const [pendingMode, setPendingMode] = useState<GameMode>('standard');

  // Game Play State
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('none');
  const [consecutiveWrong, setConsecutiveWrong] = useState<number>(0);
  const [showBreakModal, setShowBreakModal] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(false);

  // History & Telemetry
  const [history, setHistory] = useState<Question[]>([]);
  const [currentAttempts, setCurrentAttempts] = useState<Attempt[]>([]);

  // Custom Hooks
  const { settings, saveSettings } = useSettings();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    startNewSession,
    updateSession
  } = useGameSession();

  // Apply Dark Mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Timing
  const [totalStartTime, setTotalStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);

  const {
    totalElapsedTime,
    currentQuestionTime,
    setTotalElapsedTime,
    setCurrentQuestionTime
  } = useTimer(gameState, feedback, totalStartTime, questionStartTime);

  // Derived Values
  const targetTimePerQuestion = (settings.timeMinutes * 60) / settings.questionCount;
  const timeRatio = Math.min(currentQuestionTime / targetTimePerQuestion, 1);
  const isOvertime = currentQuestionTime > targetTimePerQuestion;
  const showHelp = currentQuestionTime > (targetTimePerQuestion + HELP_OVERTIME_SECONDS);
  const displayTime = currentQuestionTime.toFixed(1);

  // --- Actions ---

  const startGame = (limit: number | CustomConfig, mode: GameMode = 'standard') => {
    setDifficulty(limit);
    setGameMode(mode);
    setGameState('playing');
    setScore(0);
    setHistory([]);
    setCurrentAttempts([]);
    setInput('');
    setFeedback('none');
    setConsecutiveWrong(0);
    setShowBreakModal(false);
    setHintVisible(false);

    const now = Date.now();
    setTotalStartTime(now);
    setQuestionStartTime(now);
    setCurrentQuestionTime(0);
    setTotalElapsedTime(0);

    startNewSession(limit as any);
    setQuestion(generateQuestion(limit, ['+', '-'], [], mode));
  };

  const finishGame = useCallback((finalHistory: Question[], finalTime: number | string) => {
    setGameState('finished');
    if (currentSessionId) {
      updateSession(currentSessionId, finalHistory, finalTime, finalHistory.length >= settings.questionCount);
    }
    setCurrentSessionId(null);
  }, [currentSessionId, settings.questionCount, updateSession, setCurrentSessionId]);

  const quitGame = () => {
    finishGame(history, totalElapsedTime);
  };

  const nextQuestion = useCallback(() => {
    const timeTaken = currentQuestionTime;
    const isOver = timeTaken > targetTimePerQuestion;

    // 1. Update History
    if (question) {
      const historyItem: Question = {
        ...question,
        time: timeTaken,
        isOvertime: isOver,
        attempts: currentAttempts
      };

      const newHistory = [...history, historyItem];
      setHistory(newHistory);
      setCurrentAttempts([]);

      // 2. Persist
      if (currentSessionId) {
        updateSession(currentSessionId, newHistory, totalElapsedTime, false);
      }

      // 3. Flow
      const newScore = score + 1;
      setScore(newScore);
      setConsecutiveWrong(0);

      if (newScore >= settings.questionCount) {
        finishGame(newHistory, totalElapsedTime);
      } else {
        const nextQ = generateQuestion(difficulty as any, ['+', '-'], newHistory.slice(-5), gameMode);
        setQuestion(nextQ);
        setQuestionStartTime(Date.now());
        setInput('');
        setFeedback('none');
        setHintVisible(false);
        setCurrentAttempts([]);
      }
    }

  }, [score, totalElapsedTime, currentQuestionTime, question, difficulty, history, currentAttempts, finishGame, currentSessionId, settings.questionCount, targetTimePerQuestion, updateSession, gameMode]);

  const recordAttempt = (val: string) => {
    const attemptTime = currentQuestionTime;
    const prevAttempt = currentAttempts[currentAttempts.length - 1];
    const delta = prevAttempt ? attemptTime - prevAttempt.time : attemptTime;

    const attemptLog: Attempt = {
      value: val,
      time: attemptTime,
      delta: delta
    };
    setCurrentAttempts(prev => [...prev, attemptLog]);
  };

  // --- Input Handlers ---

  const nextQuestionRef = useRef(nextQuestion);
  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  }, [nextQuestion]);

  useEffect(() => {
    if (feedback === 'correct') {
      const timer = setTimeout(() => {
        nextQuestionRef.current();
      }, CORRECT_FEEDBACK_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Unified Checker
  const isInputCorrect = (valStr: string, currentQuestion: Question | null): boolean => {
    if (!currentQuestion) return false;
    const val = parseInt(valStr, 10);

    const target = currentQuestion.hiddenPart === 'num1'
      ? currentQuestion.num1
      : currentQuestion.hiddenPart === 'num2'
        ? currentQuestion.num2
        : currentQuestion.answer;

    return val === target;
  };

  const checkInputInstant = (valStr: string, currentQuestion: Question | null) => {
    if (!currentQuestion) return;

    if (isInputCorrect(valStr, currentQuestion)) {
      setFeedback('correct');
      setConsecutiveWrong(0);
    }
  };

  const handleInput = (digit: string) => {
    if (feedback === 'correct') return;
    if (input.length >= 2) return; // Keep limit standard
    const newInput = input + digit;
    setInput(newInput);
    checkInputInstant(newInput, question);
  };

  const handleDelete = () => {
    if (feedback === 'correct') return;
    const newInput = input.slice(0, -1);
    setInput(newInput);
  };

  const checkAnswerManual = () => {
    if (!question || input === '') return;

    if (isInputCorrect(input, question)) {
      setFeedback('correct');
    } else {
      recordAttempt(input);
      setFeedback('incorrect');
      const newWrongCount = consecutiveWrong + 1;
      setConsecutiveWrong(newWrongCount);
      if (newWrongCount >= BREAK_WRONG_THRESHOLD) {
        setShowBreakModal(true);
      }
      setTimeout(() => setFeedback('none'), INCORRECT_FEEDBACK_DELAY_MS);
      setInput('');
    }
  };

  const handleSkip = () => {
    recordAttempt('SKIPPED');
    nextQuestion();
  };

  // --- Render ---

  if (gameState === 'menu') {
    return (
      <MenuScreen
        onStart={startGame}
        settings={settings}
        onSaveSettings={saveSettings}
        goToStats={() => setGameState('stats')}
        goToCustom={(mode: GameMode) => {
          setPendingMode(mode);
          setGameState('custom_setup');
        }}
      />
    );
  }

  if (gameState === 'custom_setup') {
    return (
      <CustomSetup
        settings={settings}
        customConfig={customConfig}
        setCustomConfig={setCustomConfig}
        onSaveSettings={saveSettings}
        onStart={(cfg) => startGame(cfg, pendingMode)}
        onBack={() => setGameState('menu')}
      />
    );
  }

  if (gameState === 'stats') {
    return (
      <StatsScreen
        sessions={sessions}
        onBack={() => setGameState('menu')}
      />
    );
  }

  if (gameState === 'finished') {
    return (
      <FinishedScreen
        history={history}
        totalElapsedTime={typeof totalElapsedTime === 'number' ? totalElapsedTime : 0}
        settings={settings}
        difficulty={typeof difficulty === 'object' ? 'Custom' : difficulty}
        onRestart={() => startGame(difficulty, gameMode)}
        onHome={() => setGameState('menu')}
        sessions={sessions}
        currentSessionId={currentSessionId}
      />
    );
  }

  // Game Screen
  return (
    <GameScreen
      score={score}
      targetScore={settings.questionCount}
      question={question}
      input={input}
      feedback={feedback}
      isOvertime={isOvertime}
      timeRatio={timeRatio}
      displayTime={displayTime}
      hintVisible={hintVisible}
      showHelp={showHelp}
      showBreakModal={showBreakModal}
      mode={gameMode}

      onQuit={quitGame}
      onSkip={handleSkip}
      onHint={() => setHintVisible(true)}

      onInput={handleInput}
      onDelete={handleDelete}
      onCheck={checkAnswerManual}
      onBreakVote={(wantsBreak) => {
        if (wantsBreak) setGameState('menu');
        else {
          setConsecutiveWrong(0);
          setShowBreakModal(false);
        }
      }}
    />
  );
}

export default App;
