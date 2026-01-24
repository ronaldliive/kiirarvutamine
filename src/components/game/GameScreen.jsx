import React from 'react';
import ProgressBar from './ProgressBar';
import QuestionDisplay from './QuestionDisplay';
import Keypad from './Keypad';
import BreakModal from './BreakModal';

const GameScreen = ({
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
    onQuit,
    onSkip,
    onHint,
    onInput,
    onDelete,
    onCheck,
    onBreakVote
}) => {
    return (
        <div className="h-[100dvh] w-screen bg-zen-bg flex flex-col font-sans text-zen-text overflow-hidden text-slate-700">

            <ProgressBar
                timeRatio={timeRatio}
                isOvertime={isOvertime}
                displayTime={displayTime}
                onQuit={onQuit}
            />

            <div className="flex-grow flex flex-col relative w-full h-full max-w-md mx-auto">
                <div className="flex-none flex justify-center items-end h-12 pb-2 mt-2">
                    <span className="text-4xl text-slate-300 font-light mr-2">
                        {score}
                    </span>
                    <span className="text-lg text-slate-300 mb-1">
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
                />

                <Keypad
                    onInput={onInput}
                    onDelete={onDelete}
                    onCheck={onCheck}
                />
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
