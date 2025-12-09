import React from 'react';
import { ChevronRight, FileText, Globe } from 'lucide-react';

const ExceptionList = ({ exceptions }) => {
    if (!exceptions || exceptions.length === 0) return null;

    return (
        <div className="w-full mt-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Applicable Exceptions</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exceptions.map((ex, i) => (
                    <div key={i} className="group bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col h-full">
                        {/* Header */}
                        <div className="p-4 flex items-start gap-4 flex-1">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm shrink-0">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1 gap-2">
                                    <h4 className="font-bold text-slate-800 text-lg truncate">{ex.code}</h4>
                                    <a href="#" className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-mono border border-slate-200 hover:bg-slate-200 whitespace-nowrap">EAR §740.x</a>
                                </div>
                                <p className="text-sm text-slate-600 leading-snug line-clamp-2">{ex.description}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-emerald-50/50 px-4 py-3 border-t border-emerald-100/50 flex justify-between items-center mt-auto">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-medium text-emerald-800">Eligible</span>
                            </div>
                            <span className="text-[10px] text-emerald-600/70 font-medium flex items-center gap-1 group-hover:text-emerald-700 transition-colors cursor-pointer">
                                Verify <ChevronRight size={10} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExceptionList;
