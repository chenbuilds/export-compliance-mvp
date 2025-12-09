import React from 'react';

const ThreeDAnimationPlaceholder = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 mb-8 animate-fade-in">
            {/* 
               In a real implementation, this would be a Three.js canvas or Lottie animation.
               For now, we use a CSS abstract representation of "ExportShield Intelligence".
            */}
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border-4 border-blue-100 animate-pulse"></div>
                <div className="absolute w-32 h-32 rounded-full border-4 border-blue-200 animate-ping opacity-20"></div>
                <div className="absolute w-40 h-40 rounded-full border-2 border-indigo-400 opacity-30 animate-[spin_10s_linear_infinite]"></div>

                {/* Core Sphere */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl flex items-center justify-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tl from-blue-400 to-transparent opacity-50"></div>
                </div>

                {/* Orbiting particles */}
                <div className="absolute w-full h-full animate-[spin_4s_linear_infinite]">
                    <div className="w-3 h-3 bg-blue-400 rounded-full absolute top-0 left-1/2 -ml-1.5 shadow-lg shadow-blue-400/50"></div>
                </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                ExportShield Intelligence
            </h2>
            <p className="text-slate-400 mt-2 text-center max-w-sm">
                Ready to analyze regulations, screen entities, and accelerate your trade compliance.
            </p>
        </div>
    );
};

export default ThreeDAnimationPlaceholder;
