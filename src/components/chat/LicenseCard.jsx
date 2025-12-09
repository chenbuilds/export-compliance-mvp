import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, BookOpen, ShieldAlert } from 'lucide-react';

const LicenseCard = ({ data }) => {
    const [expanded, setExpanded] = useState(false);

    if (!data) return null;

    const { status, exceptions, trace } = data;
    const isBlocked = status === 'RESTRICTED' || status === 'BLOCKED' || status === 'LICENSE_REQUIRED'; // Normalize status

    return (
        <div className="mt-3 mb-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-fade-in-up max-w-2xl">
            {/* Header */}
            <div
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${isBlocked ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {isBlocked ? (
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <ShieldAlert size={20} />
                        </div>
                    ) : (
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <CheckCircle size={20} />
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold text-slate-900">
                            {isBlocked ? 'License Required' : 'License Exception Available'}
                        </h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                            {exceptions.length > 0
                                ? `${exceptions.length} exception(s) found (e.g., ${exceptions[0].code})`
                                : 'No exceptions found'}
                        </p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
                    {/* Exceptions List */}
                    {exceptions.length > 0 ? (
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligible Exceptions</h5>
                            {exceptions.map((ex, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-blue-700">{ex.code}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">EAR Part 740</span>
                                    </div>
                                    <p className="text-sm text-slate-700">{ex.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-red-800 text-sm">
                            No license exceptions were found for this ECCN/Destination combination. You must apply for a license.
                        </div>
                    )}

                    {/* Trace / Reasoning */}
                    {trace && trace.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Determination Trace</h5>
                            <div className="space-y-2">
                                {trace.map((step, idx) => (
                                    <div key={idx} className="flex gap-2 text-xs text-slate-600 font-mono">
                                        <span className="text-slate-400 select-none">|</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LicenseCard;
