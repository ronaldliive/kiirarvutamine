import React from 'react';
import { numberToWords } from '../../utils/formatters';
import { Question, GameMode } from '../../types';

interface QuestionDisplayProps {
    feedback: string;
    question: Question | null;
    input: string;
    isOvertime: boolean;
    hintVisible: boolean;
    showHelp: boolean;
    onSkip: () => void;
    onHint: () => void;
    mode: GameMode; // Added
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    feedback,
    question,
    input,
    isOvertime,
    hintVisible,
    showHelp,
    onSkip,
    onHint,
    mode
}) => {
    const isDetective = mode === 'detective';

    return (
        <div className={`flex-grow flex flex-col items-center justify-evenly relative p-4 transition-colors duration-300
      ${feedback === 'incorrect' ? 'bg-red-200 dark:bg-red-900/50' : ''}
    `}>

            {feedback === 'correct' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-green-100 dark:bg-green-900/80 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="text-6xl text-green-500 dark:text-green-300 font-bold mb-4">Õige!</div>
                    <div className="text-3xl text-slate-600 dark:text-slate-200 font-medium">
                        {question?.num1} {question?.operator} {question?.num2} = {question?.answer}
                    </div>
                </div>
            ) : (
                question && (
                    <>
                        <div className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-300 ${isOvertime && feedback === 'none' ? 'animate-urgent text-red-600 dark:text-red-400' : ''}`}>

                            {isDetective ? (
                                // Detective Layout: 5 ? 3 = 8
                                <div className="flex items-center gap-2 text-[3.5rem] sm:text-[4.5rem] font-bold text-inherit leading-none">
                                    <span>{question.num1}</span>

                                    {/* Operator Input Slot */}
                                    <div className={`min-w-[60px] h-[80px] flex items-center justify-center border-b-4 text-zen-accent mx-2
                                        ${input ? 'border-zen-accent' : 'border-slate-200 dark:border-slate-600'}
                                    `}>
                                        {input === '*' ? '×' : input === '/' ? '÷' : (input || '?')}
                                    </div>

                                    <span>{question.num2}</span>
                                    <span className="text-slate-300 dark:text-slate-500 text-4xl mx-2">=</span>
                                    <span>{question.answer}</span>
                                </div>
                            ) : (
                                // Standard Layout: 5 + 3 = ?
                                <>
                                    <div className="flex items-center gap-2 text-[4rem] sm:text-[5rem] font-bold text-inherit leading-none">
                                        <span>{question.num1}</span>
                                        <span className="text-zen-accent">{question.operator}</span>
                                        <span>{question.num2}</span>
                                    </div>

                                    <div className="flex items-center justify-center min-h-[4rem]">
                                        <span className="text-slate-300 dark:text-slate-500 text-4xl mr-4">=</span>
                                        <div className={`min-w-[80px] text-center border-b-4 text-[4rem] leading-none px-2 
                                    ${input ? 'border-zen-accent text-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-600 text-slate-200 dark:text-slate-600'}
                                    `}>
                                            {input || '?'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {hintVisible && !isDetective && (
                            <div className="text-blue-500 dark:text-blue-300 text-2xl font-medium mt-4 animate-in fade-in slide-in-from-bottom-2">
                                {numberToWords(question.answer)}
                            </div>
                        )}

                        {isOvertime && (
                            <div className={`w-full text-center text-red-500 font-bold mt-12 text-xl ${feedback === 'none' ? 'animate-urgent' : ''}`}>
                                Kiirusta!
                            </div>
                        )}

                        {showHelp && feedback === 'none' && (
                            <div className="flex gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4">
                                <button
                                    onClick={onSkip}
                                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold transition-colors"
                                >
                                    Jäta vahele
                                </button>
                                {!isDetective && (
                                    <button
                                        onClick={onHint}
                                        disabled={hintVisible}
                                        className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                                    >
                                        Anna vihje
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )
            )}
        </div>
    );
};

export default QuestionDisplay;
