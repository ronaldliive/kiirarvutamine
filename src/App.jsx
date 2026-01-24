import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BREAK_WRONG_THRESHOLD, HELP_OVERTIME_SECONDS, CORRECT_FEEDBACK_DELAY_MS, INCORRECT_FEEDBACK_DELAY_MS } from './utils/constants';

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

function App() {
  // Game State
  const [gameState, setGameState] = useState('menu'); // menu, custom_setup, playing, finished, stats
  const [difficulty, setDifficulty] = useState(20);
  const [customConfig, setCustomConfig] = useState({ max: 50, ops: ['+', '-', '*', '/'] });

  // Game Play State
  const [question, setQuestion] = useState(null);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('none');
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  // History & Telemetry
  const [history, setHistory] = useState([]);
  const [currentAttempts, setCurrentAttempts] = useState([]);

  // Custom Hooks
  const { settings, saveSettings } = useSettings();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    startNewSession,
    updateSession
  } = useGameSession();

  // Timing
  const [totalStartTime, setTotalStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);

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

  const startGame = (limit) => {
    setDifficulty(limit);
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

    startNewSession(limit);
    setQuestion(generateQuestion(limit, ['+', '-'], []));
  };

  const finishGame = useCallback((finalHistory, finalTime) => {
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
    const historyItem = {
      question: question.str,
      answer: question.answer,
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
      const nextQ = generateQuestion(difficulty, ['+', '-'], newHistory.slice(-5));
      setQuestion(nextQ);
      setQuestionStartTime(Date.now());
      setInput('');
      setFeedback('none');
      setHintVisible(false);
      setCurrentAttempts([]);
    }
  }, [score, totalElapsedTime, currentQuestionTime, question, difficulty, history, currentAttempts, finishGame, currentSessionId, settings.questionCount, targetTimePerQuestion, updateSession]);

  const recordAttempt = (val) => {
    const attemptTime = currentQuestionTime;
    const prevAttempt = currentAttempts[currentAttempts.length - 1];
    const delta = prevAttempt ? attemptTime - prevAttempt.time : attemptTime;

    const attemptLog = {
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

  const checkInputInstant = (valStr, currentQuestion) => {
    if (!currentQuestion) return;
    const val = parseInt(valStr, 10);
    if (val === currentQuestion.answer) {
      setFeedback('correct');
      setConsecutiveWrong(0);
    }
  };

  const handleInput = (digit) => {
    if (feedback === 'correct') return;
    if (input.length >= 2) return;
    // Special case: if input is "0" and digit is not, replace it?? No, standard string concat.
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
    const val = parseInt(input, 10);

    if (val === question.answer) {
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
        onStart={startGame}
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
        totalElapsedTime={totalElapsedTime}
        settings={settings}
        difficulty={difficulty}
        onRestart={startGame}
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
