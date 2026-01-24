import React from 'react';

const BreakModal = ({ onYes, onNo }) => {
    return (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <h2 className="text-4xl font-bold text-slate-700 mb-8 text-center">Kas soovid puhata?</h2>
            <div className="flex flex-col w-full max-w-sm gap-4">
                <button
                    onClick={onYes}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-2xl py-6 text-2xl font-bold shadow-lg transition-transform active:scale-95"
                >
                    Jah
                </button>
                <button
                    onClick={onNo}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-2xl py-6 text-2xl font-bold shadow-sm transition-transform active:scale-95"
                >
                    Ei
                </button>
            </div>
        </div>
    );
};

export default BreakModal;
