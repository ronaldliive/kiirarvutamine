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
  const [gameState, setGameState] = useState<string>('menu'); // menu, custom_setup, playing, finished, stats
  const [difficulty, setDifficulty] = useState<number | number | CustomConfig>(20); // number or object for custom
  const [customConfig, setCustomConfig] = useState<CustomConfig>({ max: 50, ops: ['+', '-', '*', '/'] });
  const [gameMode, setGameMode] = useState<GameMode>(DEFAULT_GAME_MODE as GameMode);

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
    // In detective mode, basic structure is same.
    setQuestion(generateQuestion(limit, ['+', '-'], []));
  };

  const finishGame = useCallback((finalHistory: Question[], finalTime: number | string) => {
    setGameState('finished');
    if (currentSessionId) {
      // Pass mode if supported by updateSession, currently mostly generic
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
        const nextQ = generateQuestion(difficulty as any, ['+', '-'], newHistory.slice(-5));
        setQuestion(nextQ);
        setQuestionStartTime(Date.now());
        setInput('');
        setFeedback('none');
        setHintVisible(false);
        setCurrentAttempts([]);
      }
    }

  }, [score, totalElapsedTime, currentQuestionTime, question, difficulty, history, currentAttempts, finishGame, currentSessionId, settings.questionCount, targetTimePerQuestion, updateSession]);

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
  const isInputCorrect = (valStr: string, currentQuestion: Question | null, mode: GameMode): boolean => {
    if (!currentQuestion) return false;

    if (mode === 'detective') {
      // Check if operator resolves correctly
      // question.num1 [valStr] question.num2 === question.answer
      try {
        const n1 = currentQuestion.num1;
        const n2 = currentQuestion.num2;
        const ans = currentQuestion.answer;
        // Basic operators
        let calc = 0;
        if (valStr === '+') calc = n1 + n2;
        else if (valStr === '-') calc = n1 - n2;
        else if (valStr === '*') calc = n1 * n2;
        else if (valStr === '/') calc = n1 / n2;

        return calc === ans;
      } catch {
        return false;
      }
    } else {
      // Standard check
      const val = parseInt(valStr, 10);
      return val === currentQuestion.answer;
    }
  };


  const checkInputInstant = (valStr: string, currentQuestion: Question | null) => {
    if (!currentQuestion) return;

    // In detective mode, instant check on operator click
    if (isInputCorrect(valStr, currentQuestion, gameMode)) {
      setFeedback('correct');
      setConsecutiveWrong(0);
    } else {
      // If detective mode, incorrect operator is instant fail
      if (gameMode === 'detective') {
        recordAttempt(valStr);
        setFeedback('incorrect');
        const newWrongCount = consecutiveWrong + 1;
        setConsecutiveWrong(newWrongCount);
        setTimeout(() => setFeedback('none'), INCORRECT_FEEDBACK_DELAY_MS);
        setInput('');
      }
    }
  };

  const handleInput = (char: string) => {
    if (feedback === 'correct') return;

    if (gameMode === 'detective') {
      // Operator input is length 1
      setInput(char);
      checkInputInstant(char, question);
    } else {
      // Number input
      if (input.length >= 2) return;
      const newInput = input + char;
      setInput(newInput);
      checkInputInstant(newInput, question);
    }
  };

  const handleDelete = () => {
    if (feedback === 'correct') return;
    const newInput = input.slice(0, -1);
    setInput(newInput);
  };

  const checkAnswerManual = () => {
    if (!question || input === '') return;

    if (isInputCorrect(input, question, gameMode)) {
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
        goToCustom={() => setGameState('custom_setup')}
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
        onStart={(cfg) => startGame(cfg, 'standard')} // Custom setup default to standard for now? Or pass mode?
        // Ideally custom setup should allow mode selection too, but let's stick to standard for custom currently.
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
