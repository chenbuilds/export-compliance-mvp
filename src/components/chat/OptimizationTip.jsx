import React from 'react';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

const OptimizationTip = ({ data }) => {
    if (!data || !data.tips || data.tips.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mt-4 mb-2 animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={64} className="text-indigo-600" />
                </div>

                <div className="flex items-start gap-4 z-10 relative">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                        <TrendingUp size={20} />
                    </div>

                    <div className="flex-1">
                        <h4 className="text-indigo-900 font-semibold text-sm mb-1">
                            Want a more precise result?
                        </h4>
                        <p className="text-indigo-700/80 text-xs mb-3">
                            Providing more details can verify exceptions and rule out specific risks.
                        </p>

                        <div className="space-y-2 mb-3">
                            {data.tips.map((tip, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-indigo-800 font-medium">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                    {tip}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => onAction && onAction("I want to update the assessment with these details.")}
                            className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        >
                            Add Details <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptimizationTip;
