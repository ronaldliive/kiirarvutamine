import { useState, useEffect, useRef } from 'react';

export const useTimer = (
    gameState: string,
    feedback: string,
    totalStartTime: number | null,
    questionStartTime: number | null
) => {
    const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);
    const [currentQuestionTime, setCurrentQuestionTime] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    return {
        totalElapsedTime,
        currentQuestionTime,
        setTotalElapsedTime,
        setCurrentQuestionTime
    };
};
