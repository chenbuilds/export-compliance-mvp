import React, { useState } from 'react';
import { FileCheck, ChevronDown, ChevronUp } from 'lucide-react';

const ExceptionCard = ({ ex }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
            <div
                className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/30 hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200 shadow-sm">
                        {ex.code}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider line-clamp-1">{ex.title || "License Exception"}</span>
                        {!expanded && <p className="text-sm font-medium text-slate-700 line-clamp-1">{ex.description || ex.justification || "View exceptions details..."}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full border border-emerald-200 shadow-sm">Eligible</span>
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </div>

            {expanded && (
                <div className="px-4 pb-4 pt-2 space-y-3 animate-fade-in border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{ex.description || ex.justification}</p>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</h5>
                        <ul className="space-y-1.5">
                            <li className="flex items-start gap-2 text-xs text-slate-600">
                                <div className="mt-0.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                <span>Meets destination control checks</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-slate-600">
                                <div className="mt-0.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                <span>Value threshold within limits</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-end pt-1">
                        <a
                            href={`https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                        >
                            Verify Requirement <FileCheck size={12} />
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}

const ExceptionCardGrid = ({ data }) => {
    // data: { exceptions: [ {code: "TSR", description: "..."} ] }
    const { exceptions } = data;

    if (!exceptions || exceptions.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {exceptions.map((ex, idx) => (
                <ExceptionCard key={idx} ex={ex} />
            ))}
        </div>
    );
};

export default ExceptionCardGrid;
