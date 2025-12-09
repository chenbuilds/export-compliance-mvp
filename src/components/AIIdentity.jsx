import React from 'react';

const AIIdentity = () => {
    return (
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            {/* Pulsing Glows */}
            <div className="absolute w-full h-full bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="absolute w-24 h-24 bg-indigo-500 rounded-full blur-xl opacity-30 animate-bounce"></div>

            {/* Core Orb */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50 flex items-center justify-center anime-float">
                <div className="w-12 h-12 rounded-full bg-white opacity-10 blur-sm"></div>
            </div>

            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                <div className="w-2 h-2 bg-blue-400 rounded-full absolute top-0 left-1/2 -ml-1 blur-[1px]"></div>
            </div>
            <div className="absolute inset-0 animate-[spin_12s_linear_infinite_reverse]">
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full absolute bottom-0 left-1/2 -ml-0.5 blur-[1px]"></div>
            </div>
        </div>
    );
};

export default AIIdentity;
