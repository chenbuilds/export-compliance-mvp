import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GitCommit } from 'lucide-react';

const LogicTrace = ({ data }) => {
    // data: { steps: [{step, detail, citation}] }
    const [isOpen, setIsOpen] = useState(false);
    const { steps } = data;

    if (!steps || steps.length === 0) return null;

    return (
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden mb-4 shadow-sm transition-all hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-slate-700">
                    <GitCommit size={16} className="text-indigo-500" />
                    <span className="text-sm font-semibold tracking-wide">Compliance Logic Trace</span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-5 bg-white space-y-5 animate-fade-in">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative flex gap-4 group">
                            {/* Connector Line */}
                            {idx !== steps.length - 1 && (
                                <div className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-slate-100 group-hover:bg-indigo-50 transition-colors"></div>
                            )}

                            {/* Status Dot */}
                            <div className="relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-colors shrink-0">
                                <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-indigo-600 transition-colors"></div>
                            </div>

                            <div className="flex-1 -mt-1">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{step.step}</h4>
                                <p className="text-sm text-slate-800 font-medium mb-1.5">{step.detail}</p>
                                {step.citation && (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={step.url || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] bg-slate-100 text-indigo-600 px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all truncate"
                                        >
                                            Ref: {step.citation}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LogicTrace;
