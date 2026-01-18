import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, Delete, RotateCcw, BarChart2, ChevronDown, ChevronUp, Calendar, XCircle, X, Clock } from 'lucide-react';

const TOTAL_QUESTIONS = 48;
const TARGET_TIME_PER_QUESTION = 12.5; // seconds
const STORAGE_KEY = 'math_zen_sessions';

// --- Data Helpers ---

const getSessions = () => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // Filter out sessions older than 2026-01-18 18:37
    const cutoff = new Date('2026-01-18T18:37:00+02:00').getTime();
    return all.filter(s => new Date(s.date).getTime() > cutoff);
  } catch {
    return [];
  }
};

const saveSessions = (sessions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Save failed", e);
  }
};

const formatDate = (isoString) => {
  try {
    return new Date(isoString).toLocaleString('et-EE', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

const generateQuestion = (limit, previousQuestion = null) => {
  let candidate;
  let attempts = 0;

  while (attempts < 10) {
    const operator = Math.random() > 0.5 ? '+' : '-';
    let num1, num2;

    // Generate numbers >= 1 to avoid trivial 0 operations
    if (operator === '+') {
      // Sum must be <= limit.
      // num1 minimum 1, max limit-1 (to leave room for num2 >= 1)
      // If limit is too small (e.g. 1), we can't do 1+something=1. 
      // Minimum limit for non-zero addition is 2 (1+1). 
      // We assume limit >= 10.
      num1 = Math.floor(Math.random() * (limit - 1)) + 1;
      num2 = Math.floor(Math.random() * (limit - num1)) + 1;
    } else {
      // Subtraction: num1 - num2 = answer. 
      // answer >= 0 is usually expected? Yes.
      // num1 minimum 2 (so 2-1=1), max limit.
      // Actually answer 0 is okay (5-5=0), just operand 0 is bad.
      num1 = Math.floor(Math.random() * limit) + 1;
      // num2 must be <= num1. And >= 1.
      num2 = Math.floor(Math.random() * num1) + 1;
    }

    candidate = {
      num1,
      num2,
      operator,
      answer: operator === '+' ? num1 + num2 : num1 - num2,
      str: `${num1} ${operator} ${num2}`
    };

    if (previousQuestion) {
      if (candidate.str === previousQuestion.str) {
        attempts++;
        continue;
      }
      if (candidate.operator === previousQuestion.operator && candidate.num2 === previousQuestion.num2) {
        attempts++;
        continue;
      }
    }
    break;
  }
  return candidate;
};

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished, stats
  const [difficulty, setDifficulty] = useState(20);
  const [question, setQuestion] = useState(null);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('none');

  // Timing
  const [totalStartTime, setTotalStartTime] = useState(null);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);

  // Stats & Logging
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentAttempts, setCurrentAttempts] = useState([]);
  // Initialize lazily to avoid useEffect loop
  const [sessions, setSessions] = useState(() => getSessions());
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const timerRef = useRef(null);

  // Timer Tick
  useEffect(() => {
    if (gameState === 'playing' && feedback !== 'correct') {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        if (questionStartTime) {
          const qTime = (now - questionStartTime) / 1000;
          setCurrentQuestionTime(qTime);
        }

        // Update Total Time for visual display
        if (totalStartTime) {
          setTotalElapsedTime((now - totalStartTime) / 1000);
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, questionStartTime, totalStartTime, feedback]);

  // Helper to update storage without state loop
  const updateSessionPersistence = (sessId, currentHistory, timeStr, isCompleted) => {
    const all = getSessions();
    const updated = all.map(s => {
      if (s.id === sessId) {
        return {
          ...s,
          totalTime: timeStr,
          questions: currentHistory,
          completed: isCompleted,
          lastUpdated: new Date().toISOString()
        };
      }
      return s;
    });
    saveSessions(updated);
    setSessions(updated); // Sync UI
  };

  const goToStats = () => {
    setSessions(getSessions());
    setGameState('stats');
  };

  const startGame = (limit) => {
    setDifficulty(limit);
    setGameState('playing');
    setScore(0);
    setHistory([]);
    setCurrentAttempts([]);
    setInput('');
    setFeedback('none');

    const now = Date.now();
    setTotalStartTime(now);
    setQuestionStartTime(now);
    setCurrentQuestionTime(0);
    setTotalElapsedTime(0);

    // Create NEW Session with Metadata
    const newSessionId = crypto.randomUUID();
    const userAgent = navigator.userAgent;
    // Simple device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    // Initial object
    const newSession = {
      id: newSessionId,
      date: new Date().toISOString(),
      difficulty: limit,
      totalTime: 0,
      questions: [],
      completed: false,
      device: deviceType, // Telemetry
      ip: '...' // Placeholder, will fetch
    };

    // Save immediately
    const currentSessions = getSessions();
    const newSessionsList = [newSession, ...currentSessions];
    saveSessions(newSessionsList);
    setSessions(newSessionsList);
    setCurrentSessionId(newSessionId);

    // Fetch IP asynchronously
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        // Update this specific session with IP
        const current = getSessions();
        const updated = current.map(s => s.id === newSessionId ? { ...s, ip: data.ip } : s);
        saveSessions(updated);
        setSessions(updated);
      })
      .catch(() => { /* Ignore IP fetch errors */ });

    setQuestion(generateQuestion(limit, null));
  };

  const finishGame = useCallback((finalHistory, finalTime) => {
    setGameState('finished');
    if (currentSessionId) {
      updateSessionPersistence(currentSessionId, finalHistory, finalTime, finalHistory.length >= TOTAL_QUESTIONS);
    }
    // Don't clear currentSessionId yet if we want to allow resumption, but here 'finished' is final.
    setCurrentSessionId(null);
  }, [currentSessionId]);

  const quitGame = () => {
    finishGame(history, totalElapsedTime);
  };

  const nextQuestion = useCallback(() => {
    // Capture state values for closure
    const timeTaken = currentQuestionTime;
    const isOver = timeTaken > TARGET_TIME_PER_QUESTION;

    // 1. Update History State
    const historyItem = {
      question: question.str,
      answer: question.answer,
      time: timeTaken,
      isOvertime: isOver,
      attempts: currentAttempts // Rich telemetry
    };

    const newHistory = [...history, historyItem];
    setHistory(newHistory);
    setCurrentAttempts([]); // Reset attempts for next Q

    // 2. LIVE PERSISTENCE
    if (currentSessionId) {
      updateSessionPersistence(currentSessionId, newHistory, totalElapsedTime, false);
    }

    // 3. Game Flow
    const newScore = score + 1;
    setScore(newScore);

    if (newScore >= TOTAL_QUESTIONS) {
      finishGame(newHistory, totalElapsedTime);
    } else {
      const now = Date.now();
      setQuestionStartTime(now);
      setCurrentQuestionTime(0);
      setQuestion(generateQuestion(difficulty, question)); // Pass current question as previous
      setInput('');
      setFeedback('none');
    }
  }, [score, totalElapsedTime, currentQuestionTime, question, difficulty, history, currentAttempts, finishGame, currentSessionId]);

  const recordAttempt = (val) => {
    const attemptTime = currentQuestionTime;
    // Calculate delta from previous attempt or start
    const prevAttempt = currentAttempts[currentAttempts.length - 1];
    const delta = prevAttempt ? attemptTime - prevAttempt.time : attemptTime;

    const attemptLog = {
      value: val,
      time: attemptTime,
      delta: delta
    };

    setCurrentAttempts(prev => [...prev, attemptLog]);
  };

  const checkInputInstant = (valStr, currentQuestion) => {
    if (!currentQuestion) return;
    const val = parseInt(valStr, 10);
    if (isNaN(val)) return;

    if (val === currentQuestion.answer) {
      setFeedback('correct');
      // Delay to show success
      setTimeout(() => {
        // We need to call nextQuestion. 
        // NOTE: nextQuestion depends on state. 
        // We can't call it directly if it's stale, but checks are fast.
        // It's better to rely on effect or just call it if we trust the closure.
        // Since we are inside a closure created when handleInput ran, 
        // and nextQuestion is a dependency, it should be fine.
      }, 600);
    } else {
      // Implicit wrong answer logging
      const answerLen = currentQuestion.answer.toString().length;
      if (valStr.length >= answerLen) {
        recordAttempt(valStr);
      }
    }
  };

  // Trigger nextQuestion via effect when feedback becomes correct would be cleaner,
  // but let's stick to timeout for simplicity if we can ensure nextQuestion is fresh.
  // Actually, `checkInputInstant` needs `nextQuestion`.
  // Let's use an effect for the transition to avoid closure staleness issues in timeouts.
  // Keep a ref to nextQuestion so we can call it from the effect 
  // without resetting the timeout every time nextQuestion changes (due to timer)
  const nextQuestionRef = useRef(nextQuestion);
  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  }, [nextQuestion]);

  useEffect(() => {
    if (feedback === 'correct') {
      const timer = setTimeout(() => {
        nextQuestionRef.current();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [feedback]);


  const handleInput = (digit) => {
    if (feedback === 'correct') return;
    if (input.length >= 2) return;

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
      // Effect will handle nextQuestion
    } else {
      recordAttempt(input);
      setFeedback('incorrect');
      setTimeout(() => setFeedback('none'), 400);
      setInput('');
    }
  };

  const formatTimeSeconds = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Progress Bar Logic
  const timeRatio = Math.min(currentQuestionTime / TARGET_TIME_PER_QUESTION, 1);
  const isOvertime = currentQuestionTime > TARGET_TIME_PER_QUESTION;
  const barColor = isOvertime ? 'bg-red-500' : 'bg-green-500';
  const displayTime = currentQuestionTime.toFixed(1);

  return (
    <div className="h-[100dvh] w-screen bg-zen-bg flex flex-col font-sans text-zen-text select-none overflow-hidden text-slate-700">

      {/* Top Bar */}
      {gameState === 'playing' && (
        <div className="flex-none h-10 w-full bg-slate-100 relative z-20 flex items-center justify-between">
          <div className="absolute inset-0 w-full h-full bg-slate-200">
            <div
              className={`h-full transition-all duration-100 ease-linear ${barColor}`}
              style={{ width: isOvertime ? '100%' : `${timeRatio * 100}%` }}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-between px-4">
            <span className="text-xs font-bold text-slate-600/80 w-10 text-center bg-white/50 rounded p-0.5 backdrop-blur-sm">
              {displayTime}s
            </span>

            <button
              onClick={quitGame}
              className="text-slate-500 hover:text-red-500 bg-white/50 rounded-full p-1 backdrop-blur-sm transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {gameState === 'finished' ? (
        <div className="flex-grow flex flex-col p-4 overflow-hidden relative">
          <h2 className="text-3xl font-bold text-green-500 text-center mb-2 flex-none">
            {history.length >= TOTAL_QUESTIONS ? 'Tubli!' : 'Hästi tehtud!'}
          </h2>

          <div className="flex justify-center gap-6 mb-4 flex-none">
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase">Aeg</p>
              <p className="text-2xl font-mono text-zen-accent">{formatTimeSeconds(totalElapsedTime)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase">Tehteid</p>
              <p className="text-2xl font-mono text-slate-600">{history.length}/{TOTAL_QUESTIONS}</p>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto bg-white rounded-2xl shadow-sm p-4 space-y-2 mb-4 scrollbar-hide">
            {history.map((item, idx) => (
              <div key={idx} className="flex flex-col border-b border-slate-50 last:border-0 pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 w-5 text-sm text-right">{idx + 1}.</span>
                    <span className="text-lg font-medium text-slate-700">{item.question} = {item.answer}</span>
                  </div>
                  <span className={`font-mono ${item.isOvertime ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                    {item.time.toFixed(1)}s
                  </span>
                </div>
                {/* Telemetry Display for Finished Screen */}
                {item.attempts.length > 0 && (
                  <div className="ml-9 mt-1 flex flex-col gap-1">
                    {item.attempts.map((att, aidx) => (
                      <div key={aidx} className="text-xs text-red-400 flex items-center gap-2">
                        <XCircle size={10} />
                        <span>Pakkus <b>{att.value}</b></span>
                        <span className="text-slate-400">@{att.time.toFixed(1)}s</span>
                        {aidx > 0 && (
                          <span className="text-orange-300 text-[10px]">(vahe {att.delta.toFixed(1)}s)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-none gap-3 flex flex-col">
            <button
              onClick={() => startGame(difficulty)}
              className="bg-zen-accent hover:bg-sky-500 text-white rounded-2xl py-4 text-xl font-semibold shadow-md transition-colors w-full flex items-center justify-center gap-2"
            >
              <RotateCcw size={24} /> Uuesti
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="bg-slate-100 text-slate-500 rounded-2xl py-3 text-lg font-medium shadow-sm transition-colors w-full"
            >
              Algusesse
            </button>
          </div>
        </div>
      ) : gameState === 'menu' ? (
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl font-bold text-slate-700">Kiirarvutamine</h1>
            <p className="text-slate-400">Vali raskusaste</p>
          </div>

          <div className="w-full max-w-sm space-y-4 mb-12">
            <button
              onClick={() => startGame(10)}
              className="w-full bg-white hover:bg-green-50 border-2 border-green-100 text-green-600 py-6 rounded-3xl text-2xl font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              10 piires
            </button>
            <button
              onClick={() => startGame(20)}
              className="w-full bg-zen-accent hover:bg-sky-500 text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              20 piires
            </button>
          </div>

          <button
            onClick={goToStats}
            className="absolute top-6 right-6 text-slate-400 hover:text-zen-accent p-2 bg-white rounded-full shadow-sm"
          >
            <BarChart2 size={24} />
          </button>

          <div className="text-sm text-slate-300 text-center max-w-xs absolute bottom-8">
            Eesmärk: 48 tehet<br />
            Tempo: 12.5s tehte kohta
          </div>
        </div>
      ) : gameState === 'stats' ? (
        <div className="flex-grow flex flex-col bg-slate-50 relative h-full">
          <div className="flex-none bg-white p-4 shadow-sm flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <BarChart2 size={20} className="text-zen-accent" /> Statistika
            </h2>
            <button
              onClick={() => setGameState('menu')}
              className="text-slate-400 hover:text-slate-600"
            >
              <XCircle size={28} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center text-slate-400 mt-10">Ajalugu puudub</div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                  <div
                    onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                    className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Calendar size={14} />
                        {formatDate(session.date)}
                        {!session.completed && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded-full">Pooleli</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className={session.questions.length < TOTAL_QUESTIONS ? "text-orange-400 font-medium" : ""}>
                          {session.questions.length}/{TOTAL_QUESTIONS}
                        </span> • {session.difficulty} piires • {formatTimeSeconds(session.totalTime)}
                      </div>
                    </div>
                    <div className="text-slate-300">
                      {expandedSessionId === session.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Detailed Dropdown */}
                  {expandedSessionId === session.id && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-2 text-sm space-y-2 max-h-80 overflow-y-auto">
                      {/* Metadata Display in Detailed View */}
                      <div className="flex gap-2 mb-2 text-[10px] text-slate-400 font-mono px-2">
                        <span>{session.device || 'Unknown'}</span>
                        {session.ip && <span>• {session.ip}</span>}
                      </div>

                      {session.questions.map((q, i) => (
                        <div key={i} className="flex flex-col border-b border-slate-100 last:border-0 pb-1">
                          <div className="flex justify-between px-2 py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 w-4">{i + 1}.</span>
                              <span className={q.attempts.length > 0 ? "text-orange-500 font-medium" : "text-slate-600"}>
                                {q.question} = {q.answer}
                              </span>
                            </div>
                            <span className={`font-mono ${q.isOvertime ? 'text-red-500' : 'text-green-600'}`}>
                              {q.time.toFixed(1)}s
                            </span>
                          </div>
                          {/* Telemetry in History */}
                          {q.attempts && q.attempts.length > 0 && (
                            <div className="px-8 pb-1 flex flex-wrap gap-x-3 gap-y-1">
                              {q.attempts.map((att, aidx) => (
                                <span key={aidx} className="text-xs text-red-400 flex items-center gap-1 bg-white px-1.5 rounded border border-red-50">
                                  <span className="font-bold">{att.value}</span>
                                  <span className="text-slate-400 text-[10px] flex items-center">
                                    <Clock size={8} className="mr-0.5" />
                                    {att.time.toFixed(1)}s
                                    {aidx > 0 && ` (+${att.delta.toFixed(1)}s)`}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Game Playing Screen
        <div className="flex-grow flex flex-col relative w-full h-full max-w-md mx-auto">
          {/* Header Score */}
          <div className="flex-none flex justify-center items-end h-12 pb-2 mt-2">
            <span className="text-4xl text-slate-300 font-light mr-2">
              {score}
            </span>
            <span className="text-lg text-slate-300 mb-1">
              / {TOTAL_QUESTIONS}
            </span>
          </div>

          {/* Question Area */}
          <div className={`flex-grow flex flex-col items-center justify-center relative p-4 transition-colors duration-300
                    ${feedback === 'incorrect' ? 'bg-red-200' : ''}
            `}>

            {feedback === 'correct' ? (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-green-100 animate-in fade-in duration-200">
                <div className="text-6xl text-green-500 font-bold">Õige!</div>
              </div>
            ) : (
              question && (
                <div className={`flex flex-col items-center gap-4 transition-all duration-300 ${isOvertime && feedback === 'none' ? 'animate-urgent text-red-600' : ''}`}>
                  {/* Equation */}
                  <div className="flex items-center gap-2 text-[4rem] sm:text-[5rem] font-bold text-inherit leading-none">
                    <span>{question.num1}</span>
                    <span className="text-zen-accent">{question.operator}</span>
                    <span>{question.num2}</span>
                  </div>

                  {/* Input Display */}
                  <div className="mt-4 flex items-center justify-center min-h-[4rem]">
                    <span className="text-slate-300 text-4xl mr-4">=</span>
                    <div className={`min-w-[80px] text-center border-b-4 text-[4rem] leading-none px-2 
                                ${input ? 'border-zen-accent text-slate-800' : 'border-slate-200 text-slate-200'}
                                `}>
                      {input || '?'}
                    </div>
                  </div>

                  {isOvertime && (
                    <div className="text-red-500 font-bold mt-4 text-xl">
                      Kiirusta!
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Keypad */}
          {gameState === 'playing' && (
            <div className="flex-none p-4 pb-safe bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleInput(n.toString())}
                    className="h-14 sm:h-16 rounded-2xl bg-slate-50 text-3xl font-semibold text-slate-700 shadow-sm active:bg-slate-200 transition-colors border border-slate-100"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={handleDelete}
                  className="h-14 sm:h-16 rounded-2xl bg-slate-100 text-slate-500 shadow-sm flex items-center justify-center active:bg-slate-200 transition-colors border border-slate-200"
                >
                  <Delete size={32} />
                </button>
                <button
                  onClick={() => handleInput('0')}
                  className="h-14 sm:h-16 rounded-2xl bg-slate-50 text-3xl font-semibold text-slate-700 shadow-sm active:bg-slate-200 transition-colors border border-slate-100"
                >
                  0
                </button>
                <button
                  onClick={checkAnswerManual}
                  className="h-14 sm:h-16 rounded-2xl bg-green-50 text-green-600 shadow-sm flex items-center justify-center active:bg-green-100 transition-colors border border-green-100"
                >
                  <CheckCircle2 size={32} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
