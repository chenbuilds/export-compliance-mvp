import React from 'react';
import { Square, CheckSquare } from 'lucide-react';

const NextSteps = ({ steps }) => {
    if (!steps || steps.length === 0) return null;

    return (
        <div className="mt-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 max-w-2xl">
            <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">Recommended Actions</h5>
            <div className="space-y-2">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <Square size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NextSteps;
