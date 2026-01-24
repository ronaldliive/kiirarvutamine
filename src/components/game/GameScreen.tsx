import React from 'react';
import ProgressBar from './ProgressBar';
import QuestionDisplay from './QuestionDisplay';
import Keypad from './Keypad';
import OperatorKeypad from './OperatorKeypad';
import BreakModal from './BreakModal';
import { Question, GameMode } from '../../types';

interface GameScreenProps {
    score: number;
    targetScore: number;
    question: Question | null;
    input: string;
    feedback: string;
    isOvertime: boolean;
    timeRatio: number;
    displayTime: string;
    hintVisible: boolean;
    showHelp: boolean;
    showBreakModal: boolean;
    mode: GameMode; // Added
    onQuit: () => void;
    onSkip: () => void;
    onHint: () => void;
    onInput: (val: string) => void;
    onDelete: () => void;
    onCheck: () => void;
    onBreakVote: (wantsBreak: boolean) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
    score,
    targetScore,
    question,
    input,
    feedback,
    isOvertime,
    timeRatio,
    displayTime,
    hintVisible,
    showHelp,
    showBreakModal,
    mode,
    onQuit,
    onSkip,
    onHint,
    onInput,
    onDelete,
    onCheck,
    onBreakVote
}) => {
    const isDetective = mode === 'detective';

    return (
        <div className="h-[100dvh] w-screen bg-zen-bg dark:bg-slate-900 flex flex-col font-sans text-zen-text dark:text-white overflow-hidden transition-colors duration-300">

            <ProgressBar
                timeRatio={timeRatio}
                isOvertime={isOvertime}
                displayTime={displayTime}
                onQuit={onQuit}
            />

            <div className="flex-grow flex flex-col relative w-full h-full max-w-md mx-auto">
                <div className="flex-none flex justify-center items-end h-12 pb-2 mt-2">
                    <span className="text-4xl text-slate-300 dark:text-slate-600 font-light mr-2">
                        {score}
                    </span>
                    <span className="text-lg text-slate-300 dark:text-slate-600 mb-1">
                        / {targetScore}
                    </span>
                </div>

                <QuestionDisplay
                    feedback={feedback}
                    question={question}
                    input={input}
                    isOvertime={isOvertime}
                    hintVisible={hintVisible}
                    showHelp={showHelp}
                    onSkip={onSkip}
                    onHint={onHint}
                    mode={mode}
                />

                {isDetective ? (
                    <OperatorKeypad onInput={onInput} />
                ) : (
                    <Keypad
                        onInput={onInput}
                        onDelete={onDelete}
                        onCheck={onCheck}
                    />
                )}
            </div>

            {showBreakModal && (
                <BreakModal
                    onYes={() => onBreakVote(true)}
                    onNo={() => onBreakVote(false)}
                />
            )}
        </div>
    );
};

export default GameScreen;
