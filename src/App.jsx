import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, Delete, RotateCcw, BarChart2, ChevronDown, ChevronUp, Calendar, XCircle, X, Clock, Share2, Download, Settings } from 'lucide-react';

const STORAGE_KEY = 'math_zen_sessions';
const SETTINGS_KEY = 'math_zen_settings';

const DEFAULT_SETTINGS = {
  questionCount: 48,
  timeMinutes: 10
};

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

const generateCSV = (session) => {
  // 1. Metadata Section
  const dateStr = new Date(session.date).toLocaleString('et-EE');
  const mistakes = session.questions.filter(q => q.attempts.length > 0).length;
  const totalSec = session.totalTime;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const timeStr = `${m}m ${s}s`;

  const metadata = [
    ['Kiirarvutamine', `${session.difficulty}-piires`],
    ['Kuupäev', dateStr],
    ['Tulemus', `${session.questions.length} vastatud`],
    ['Aeg', timeStr],
    ['Vigu', mistakes],
    [] // Empty row
  ].map(row => row.join(';')).join('\n');

  // 2. Data Table
  const headers = ['Tehe;Vastus;Aeg (s);Vead (pakkumised);Üle aja'];
  const rows = session.questions.map(q => {
    // Format attempts nicely: "4, 9" (comma separated inside the field)
    const attemptsStr = q.attempts ? q.attempts.map(a => a.value).join(', ') : '';
    // Boolean to Est
    const isOvertimeStr = q.isOvertime ? 'Jah' : '';

    // Use semicolon separator for columns
    return `${q.question};${q.answer};${q.time.toFixed(1).replace('.', ',')};"${attemptsStr}";${isOvertimeStr}`;
  });

  // Combine with BOM for Excel UTF-8 compatibility
  return '\uFEFF' + metadata + '\n' + headers + '\n' + rows.join('\n');
};

const downloadCSV = (session) => {
  const csvContent = generateCSV(session);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kiirarvutamine_${session.date.slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateClipboardText = (session) => {
  const dateStr = new Date(session.date).toLocaleString('et-EE');
  const mistakes = session.questions.filter(q => q.attempts.length > 0).length;
  // Format:
  // Kiirarvutamine 20-piires
  // 18.01.2026 12:30
  // Tulemus: 48/48
  // Aeg: 2m 30s
  // Vead: 3

  const totalSec = session.totalTime;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const timeStr = `${m}m ${s}s`;

  // Use session.questionCount or fallback to session.questions.length if completed
  const totalQs = session.questions.length; // Simplified for clipboard

  return `Kiirarvutamine ${session.difficulty}-piires\n${dateStr}\nTulemus: ${session.questions.length}/${totalQs}\nAeg: ${timeStr}\nVead: ${mistakes}`;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

const numberToWords = (num) => {
  const ones = ['null', 'üks', 'kaks', 'kolm', 'neli', 'viis', 'kuus', 'seitse', 'kaheksa', 'üheksa', 'kümme'];
  const teens = ['üksteist', 'kaksteist', 'kolmteist', 'neliteist', 'viisteist', 'kuusteist', 'seitseteist', 'kaheksateist', 'üheksateist'];
  const tens = ['', '', 'kakskümmend', 'kolmkümmend', 'nelikümmend', 'viiskümmend', 'kuuskümmend', 'seitsekümmend', 'kaheksakümmend', 'üheksakümmend'];

  if (num <= 10) return ones[num];
  if (num < 20) return teens[num - 11];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (one === 0) return tens[ten];
    return `${tens[ten]} ${ones[one]}`;
  }
  return num.toString();
};

// Safe random helper
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateQuestion = (limit, existingOps = ['+', '-'], recentHistory = []) => {
  let candidate;
  let attempts = 0;

  // If limit is an object, it's custom config
  const maxVal = typeof limit === 'object' ? limit.max : limit;
  // Robustly handle ops: default to +,- if null
  const methods = (typeof limit === 'object' ? limit.ops : existingOps) || ['+', '-'];

  // Analysis of recent history for filtering
  const lastItem = recentHistory[recentHistory.length - 1];
  const lastAnswer = lastItem ? lastItem.answer : null;
  const recentStrings = new Set(recentHistory.map(h => h.question));

  while (attempts < 50) {
    const operator = methods[Math.floor(Math.random() * methods.length)];
    let num1, num2;

    switch (operator) {
      case '+':
        // sum <= maxVal, avoid 0 if possible
        if (maxVal < 2) { num1 = 0; num2 = 0; }
        else {
          num1 = randomInt(1, maxVal - 1);
          num2 = randomInt(1, maxVal - num1);
        }
        break;
      case '-':
        // result >= 0
        if (maxVal < 1) { num1 = 0; num2 = 0; }
        else {
          num1 = randomInt(1, maxVal);
          num2 = randomInt(1, num1);
        }
        break;
      case '*':
        if (maxVal < 4) {
          num1 = randomInt(1, maxVal);
          num2 = 1;
        } else {
          num1 = randomInt(2, Math.floor(maxVal / 2));
          // Ensure product fits
          const maxNum2 = Math.floor(maxVal / num1);
          if (maxNum2 < 2) { num2 = 1; }
          else { num2 = randomInt(2, maxNum2); }
        }
        break;
      case '/':
        if (maxVal < 4) {
          num1 = 1; num2 = 1;
        } else {
          const answer = randomInt(2, Math.floor(maxVal / 2));
          const maxDivisor = Math.floor(maxVal / answer);
          if (maxDivisor < 2) { num2 = 1; }
          else { num2 = randomInt(2, maxDivisor); }
          num1 = answer * num2;
        }
        break;
      default:
        num1 = 1; num2 = 1;
    }

    let ans;
    switch (operator) {
      case '+': ans = num1 + num2; break;
      case '-': ans = num1 - num2; break;
      case '*': ans = num1 * num2; break;
      case '/': ans = num1 / num2; break;
      default: ans = 0;
    }

    candidate = {
      num1,
      num2,
      operator,
      answer: ans,
      str: `${num1} ${operator} ${num2}`
    };

    // --- LOGIC CHECKS ---

    // 1. Triviality Check
    // "5-5" (result 0), "N-0", "N+0" (not generated by current randomInt but safe to check), "N*1", "N/1"
    const isTrivial =
      (operator === '-' && num1 === num2) ||
      (operator === '+' && (num1 === 0 || num2 === 0)) ||
      (operator === '*' && (num1 === 1 || num2 === 1)) ||
      (operator === '/' && num2 === 1);

    if (isTrivial) {
      // Allow trivial questions 15% of time, otherwise skip
      if (Math.random() > 0.15) {
        attempts++; continue;
      }
    }

    // 2. Strict Repetition
    if (recentStrings.has(candidate.str)) {
      attempts++; continue;
    }

    // 3. Consecutive Same Answer
    if (lastAnswer !== null && ans === lastAnswer) {
      // Allow if we tried too many times (fallback)
      if (attempts < 20) { attempts++; continue; }
    }

    // 4. Commutative Repetition (2+3 vs 3+2)
    if (operator === '+' || operator === '*') {
      const reversed = `${num2} ${operator} ${num1}`;
      if (recentStrings.has(reversed)) {
        attempts++; continue;
      }
    }

    // 5. Difficulty Tiering
    // If we are in "20 piires" (or higher), avoid "10 piires" questions to keep it challenging.
    // e.g. 7+1=8 is technically < 20, but it belongs to the easier level.
    // We want the result (for +) or the start number (for -) to be > 10.
    if (maxVal >= 20) {
      if (operator === '+' && ans <= 10) {
        attempts++; continue;
      }
      if (operator === '-' && num1 <= 10) {
        attempts++; continue;
      }
    }

    break;
  }
  return candidate;
};

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, custom_setup, playing, finished, stats
  const [difficulty, setDifficulty] = useState(20); // Can be int (preset) or object (custom)
  const [customConfig, setCustomConfig] = useState({
    max: 50,
    ops: ['+', '-', '*', '/']
  });
  const [question, setQuestion] = useState(null);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('none');
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Derived constants based on settings
  const targetTimePerQuestion = (settings.timeMinutes * 60) / settings.questionCount;

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };


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
  const [hintVisible, setHintVisible] = useState(false); // New state for hint

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
    setTotalStartTime(now);
    setQuestionStartTime(now);
    setCurrentQuestionTime(0);
    setTotalElapsedTime(0);
    setConsecutiveWrong(0);
    setShowBreakModal(false);

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
      ip: null // Will be updated by fetch
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

    setQuestion(generateQuestion(limit, ['+', '-'], []));
  };

  const finishGame = useCallback((finalHistory, finalTime) => {
    setGameState('finished');
    if (currentSessionId) {
      updateSessionPersistence(currentSessionId, finalHistory, finalTime, finalHistory.length >= settings.questionCount);
    }
    // Don't clear currentSessionId yet if we want to allow resumption, but here 'finished' is final.
    setCurrentSessionId(null);
  }, [currentSessionId, settings.questionCount]);

  const quitGame = () => {
    finishGame(history, totalElapsedTime);
  };

  const nextQuestion = useCallback(() => {
    // Capture state values for closure
    const timeTaken = currentQuestionTime;
    const isOver = timeTaken > targetTimePerQuestion;

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
    setConsecutiveWrong(0); // Reset on correct answer (next question)

    if (newScore >= settings.questionCount) {
      finishGame(newHistory, totalElapsedTime);
    } else {
      const nextQ = generateQuestion(difficulty, ['+', '-'], newHistory.slice(-5));
      setQuestion(nextQ);
      setQuestionStartTime(Date.now());
      setInput('');
      setFeedback('none');
      setQuestion(nextQ);
      setQuestionStartTime(Date.now());
      setInput('');
      setFeedback('none');
      setHintVisible(false); // Reset hint
      setCurrentAttempts([]);
    }
  }, [score, totalElapsedTime, currentQuestionTime, question, difficulty, history, currentAttempts, finishGame, currentSessionId, settings.questionCount, targetTimePerQuestion]);

  const handleSkip = () => {
    recordAttempt('SKIPPED');
    // Allow a small delay to register the attempt if needed, but sync ref is updated.
    // We can just call nextQuestion.
    nextQuestion();
  };

  const handleHint = () => {
    setHintVisible(true);
  };

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
      setConsecutiveWrong(0);
      // Delay to show success
      setTimeout(() => {
        // We need to call nextQuestion. 
        // NOTE: nextQuestion depends on state. 
        // We can't call it directly if it's stale, but checks are fast.
        // It's better to rely on effect or just call it if we trust the closure.
        // Since we are inside a closure created when handleInput ran, 
        // and nextQuestion is a dependency, it should be fine.
      }, 1500);
    } else {
      // Implicit wrong answer logging
      const answerLen = currentQuestion.answer.toString().length;
      if (valStr.length >= answerLen) {
        // We do NOT record failure here to avoid double-counting 
        // if user also clicks manual check. 
        // Only auto-advance if CORRECT.
        // recordAttempt(valStr); 
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
      }, 1500);
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

      const newWrongCount = consecutiveWrong + 1;
      setConsecutiveWrong(newWrongCount);
      if (newWrongCount >= 3) {
        setShowBreakModal(true);
      }

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
  const timeRatio = Math.min(currentQuestionTime / targetTimePerQuestion, 1);
  const isOvertime = currentQuestionTime > targetTimePerQuestion;
  const barColor = isOvertime ? 'bg-red-500' : 'bg-green-500';

  // Feature: Show help if > 60s overtime (for all difficulties)
  const showHelp = currentQuestionTime > (targetTimePerQuestion + 60);

  const displayTime = currentQuestionTime.toFixed(1);

  return (
    <div className="h-[100dvh] w-screen bg-zen-bg flex flex-col font-sans text-zen-text overflow-hidden text-slate-700">

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
            {history.length >= settings.questionCount ? 'Tubli!' : 'Hästi tehtud!'}
          </h2>

          <div className="flex justify-center gap-6 mb-4 flex-none">
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase">Aeg</p>
              <p className="text-2xl font-mono text-zen-accent">{formatTimeSeconds(totalElapsedTime)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase">Tehteid</p>
              <p className="text-2xl font-mono text-slate-600">{history.length}/{settings.questionCount}</p>
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
              onClick={async () => {
                // Find current session object from history + time
                // Or just reconstruction since we have the data
                // Better: find by currentSessionId if we have it, or construct ad-hoc
                const sessionToShare = sessions.find(s => s.id === currentSessionId) || {
                  difficulty, date: new Date().toISOString(), totalTime: totalElapsedTime, questions: history
                };
                const text = generateClipboardText(sessionToShare);
                const success = await copyToClipboard(text);
                if (success) alert("Tulemus kopeeritud!");
              }}
              className="bg-green-500 hover:bg-green-600 text-white rounded-2xl py-4 text-xl font-semibold shadow-md transition-colors w-full flex items-center justify-center gap-2"
            >
              <Share2 size={24} /> Jaga sõbraga
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
              className="w-full bg-zen-accent hover:bg-sky-500 text-white py-6 rounded-3xl text-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
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
            onClick={() => setGameState('custom_setup')}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm"
          >
            <Settings size={28} />
          </button>

          <button
            onClick={goToStats}
            className="absolute top-6 right-6 text-slate-400 hover:text-zen-accent p-2 bg-white rounded-full shadow-sm"
          >
            <BarChart2 size={24} />
          </button>

          <div className="text-sm text-slate-300 text-center max-w-xs absolute bottom-8">
            Eesmärk: {settings.questionCount} tehet<br />
            Tempo: {targetTimePerQuestion.toFixed(1).replace('.', ',')}s tehte kohta
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-700">Seaded</h3>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Tehete arv (eesmärk)</label>
                    <input
                      type="number"
                      value={settings.questionCount}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow empty string or numbers
                        const num = parseInt(val);
                        if (val === '' || !isNaN(num)) {
                          // Directly update state, validation happens on Blur or Save if needed, 
                          // but for now let's keep it simple: just don't force '1' immediately if empty
                          if (val === '') {
                            saveSettings({ ...settings, questionCount: '' });
                          } else {
                            saveSettings({ ...settings, questionCount: num });
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Validate on blur: if empty or < 1, reset to 1 (or keep previous valid?)
                        // "1" is a safe fallback
                        const val = parseInt(e.target.value) || 0;
                        if (val < 1) {
                          saveSettings({ ...settings, questionCount: 1 });
                        }
                      }}
                      className="w-full text-center text-2xl font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zen-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Aeg kokku (minutites)</label>
                    <input
                      type="number"
                      value={settings.timeMinutes}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = parseInt(val);
                        if (val === '' || !isNaN(num)) {
                          if (val === '') {
                            saveSettings({ ...settings, timeMinutes: '' });
                          } else {
                            saveSettings({ ...settings, timeMinutes: num });
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val < 1) {
                          saveSettings({ ...settings, timeMinutes: 1 });
                        }
                      }}
                      className="w-full text-center text-2xl font-bold p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zen-accent"
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-blue-400 uppercase font-bold mb-1">Arvutatud tempo</p>
                    <p className="text-3xl font-bold text-blue-600 flex justify-center items-baseline gap-1">
                      {targetTimePerQuestion.toFixed(1).replace('.', ',')}
                      <span className="text-sm font-medium text-blue-400">sek/tehe</span>
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-zen-accent hover:bg-sky-500 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Salvesta
                </button>
              </div>
            </div>
          )}
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
                        <span className={session.questions.length < settings.questionCount ? "text-orange-400 font-medium" : ""}>
                          {session.questions.length} vastatud
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

                      <div className="flex gap-2 mb-4 px-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const text = generateClipboardText(session);
                            await copyToClipboard(text);
                            alert("Tulemus kopeeritud!");
                          }}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-1.5 px-3 rounded-full transition-colors"
                        >
                          <Share2 size={12} /> Kopeeri
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadCSV(session);
                          }}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-1.5 px-3 rounded-full transition-colors"
                        >
                          <Download size={12} /> Lae CSV
                        </button>
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
                          {/* Telemetry in History - Vertical List to match screenshots */}
                          {q.attempts && q.attempts.length > 0 && (
                            <div className="px-4 pb-1 flex flex-col gap-1 mt-1">
                              {q.attempts.map((att, aidx) => (
                                <div key={aidx} className="text-xs text-red-500 flex items-center gap-2">
                                  <XCircle size={10} />
                                  <span>Pakkus <span className="font-bold">{att.value}</span></span>
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
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : gameState === 'custom_setup' ? (
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative bg-slate-50">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-6 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-slate-700">Kohanda mängu</h2>
              <button onClick={() => setGameState('menu')} className="text-slate-400 hover:text-slate-600">
                <XCircle size={28} />
              </button>
            </div>

            {/* Global Settings (Time & Count) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Tehteid</label>
                <input
                  type="number"
                  value={settings.questionCount}
                  onChange={(e) => saveSettings({ ...settings, questionCount: parseInt(e.target.value) || 1 })}
                  className="w-full text-center text-xl font-bold p-3 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Aeg (min)</label>
                <input
                  type="number"
                  value={settings.timeMinutes}
                  onChange={(e) => saveSettings({ ...settings, timeMinutes: parseInt(e.target.value) || 1 })}
                  className="w-full text-center text-xl font-bold p-3 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Max Value Input */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Arvude piir (max)</label>
              <input
                type="number"
                value={customConfig.max}
                onChange={(e) => setCustomConfig({ ...customConfig, max: parseInt(e.target.value) || 20 })}
                className="w-full text-center text-3xl font-bold p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-zen-accent focus:outline-none"
              />
            </div>

            {/* Operators Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3">Vali tehted</label>
              <div className="grid grid-cols-4 gap-3">
                {['+', '-', '*', '/'].map(op => {
                  const isActive = customConfig.ops.includes(op);
                  return (
                    <button
                      key={op}
                      onClick={() => {
                        const currentOps = customConfig.ops;
                        let newOps;
                        if (isActive) {
                          // Prevent removing last one
                          if (currentOps.length === 1) return;
                          newOps = currentOps.filter(o => o !== op);
                        } else {
                          newOps = [...currentOps, op];
                        }
                        setCustomConfig({ ...customConfig, ops: newOps });
                      }}
                      className={`h-14 rounded-xl text-2xl font-bold flex items-center justify-center transition-all ${isActive
                        ? 'bg-zen-accent text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                      {op === '*' ? '×' : op === '/' ? '÷' : op}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => startGame(customConfig)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl text-xl font-bold shadow-lg transition-transform active:scale-95 mt-4"
            >
              Alusta
            </button>
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
              / {settings.questionCount}
            </span>
          </div>

          {/* Question Area - Improved Responsiveness */}
          <div className={`flex-grow flex flex-col items-center justify-evenly relative p-4 transition-colors duration-300
                    ${feedback === 'incorrect' ? 'bg-red-200' : ''}
            `}>

            {feedback === 'correct' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-green-100 animate-in fade-in duration-200">
                <div className="text-6xl text-green-500 font-bold mb-4">Õige!</div>
                <div className="text-3xl text-slate-600 font-medium">
                  {question.num1} {question.operator} {question.num2} = {question.answer}
                </div>
              </div>
            ) : (
              question && (
                <>
                  <div className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-300 ${isOvertime && feedback === 'none' ? 'animate-urgent text-red-600' : ''}`}>
                    {/* Equation */}
                    <div className="flex items-center gap-2 text-[4rem] sm:text-[5rem] font-bold text-inherit leading-none">
                      <span>{question.num1}</span>
                      <span className="text-zen-accent">{question.operator}</span>
                      <span>{question.num2}</span>
                    </div>

                    {/* Input Display - Now on the same line if fits */}
                    <div className="flex items-center justify-center min-h-[4rem]">
                      <span className="text-slate-300 text-4xl mr-4">=</span>
                      <div className={`min-w-[80px] text-center border-b-4 text-[4rem] leading-none px-2 
                                  ${input ? 'border-zen-accent text-slate-800' : 'border-slate-200 text-slate-200'}
                                  `}>
                        {input || '?'}
                      </div>
                    </div>
                  </div>

                  {/* Hint Display - Words */}
                  {hintVisible && (
                    <div className="text-blue-500 text-2xl font-medium mt-4 animate-in fade-in slide-in-from-bottom-2">
                      {numberToWords(question.answer)}
                    </div>
                  )}

                  {isOvertime && (
                    <div className={`w-full text-center text-red-500 font-bold mt-12 text-xl ${feedback === 'none' ? 'animate-urgent' : ''}`}>
                      Kiirusta!
                    </div>
                  )}

                  {/* Help Buttons (Skip / Hint) */}
                  {showHelp && feedback === 'none' && (
                    <div className="flex gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4">
                      <button
                        onClick={handleSkip}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-6 py-3 rounded-xl font-bold transition-colors"
                      >
                        Jäta vahele
                      </button>
                      <button
                        onClick={handleHint}
                        disabled={hintVisible}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                      >
                        Anna vihje
                      </button>
                    </div>
                  )}
                </>
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
      )
      }

      {/* Break Modal */}
      {
        showBreakModal && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <h2 className="text-4xl font-bold text-slate-700 mb-8 text-center">Kas soovid puhata?</h2>
            <div className="flex flex-col w-full max-w-sm gap-4">
              <button
                onClick={() => setGameState('menu')}
                className="bg-green-500 hover:bg-green-600 text-white rounded-2xl py-6 text-2xl font-bold shadow-lg transition-transform active:scale-95"
              >
                Jah
              </button>
              <button
                onClick={() => {
                  setConsecutiveWrong(0);
                  setShowBreakModal(false);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-2xl py-6 text-2xl font-bold shadow-sm transition-transform active:scale-95"
              >
                Ei
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default App;
