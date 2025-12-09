import React, { useState } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, ChevronDown, ChevronUp, ExternalLink, FileText, ShieldAlert } from 'lucide-react';

const ComplianceBadge = ({ status }) => {
    const config = {
        'CLEAR': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'CLEAR' },
        'WARNING': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle, label: 'WARNING' },
        'RESTRICTED': { color: 'bg-red-100 text-red-700 border-red-200', icon: ShieldAlert, label: 'RESTRICTED' },
        'MISSING_DATA': { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: HelpCircle, label: 'DATA MISSING' }
    };

    const style = config[status] || config['MISSING_DATA'];
    const Icon = style.icon;

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${style.color}`}>
            <Icon size={14} />
            {style.label}
        </div>
    );
};

const ExceptionCard = ({ exception }) => (
    <div className="flex flex-col p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {exception.code}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Eligible
            </span>
        </div>
        <h4 className="text-sm font-semibold text-slate-800 leading-tight mb-1">{exception.title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">{exception.justification}</p>

        <div className="mt-auto border-t border-slate-100 pt-2 flex items-center gap-1 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors text-[10px] font-medium uppercase tracking-wide">
            <ExternalLink size={10} />
            <span>Verify Requirement</span>
        </div>
    </div>
);

const RiskTag = ({ type, level }) => {
    const isRisk = level !== 'CLEAR' && level !== 'LOW';
    if (!isRisk) return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-medium">
            <CheckCircle size={12} />
            No {type} Risk
        </div>
    );

    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-bold animate-pulse-slow">
            <AlertCircle size={12} />
            {type} Risk: {level}
        </div>
    );
};

const StructuredResponse = ({ data }) => {
    const [isTraceOpen, setIsTraceOpen] = useState(false);

    // Safety check
    if (!data) return null;

    const { license_result, screenings } = data;
    const licenseStatus = license_result?.status || 'MISSING_DATA';
    const exceptions = license_result?.exceptions || [];
    const trace = license_result?.trace || [];

    // Helper to find specific screening
    const getScreening = (engine) => screenings.find(s => s.engine === engine);
    const dps = getScreening('DPS');
    const uflpa = getScreening('UFLPA');

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fade-in-up">

            {/* 1. RESULT BANNER */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compliance Analysis</span>
                <ComplianceBadge status={licenseStatus} />
            </div>

            {/* 2. EXCEPTIONS GRID */}
            {exceptions.length > 0 ? (
                <div className="p-5 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Available Exceptions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {exceptions.map((ex, i) => (
                            <ExceptionCard key={i} exception={ex} />
                        ))}
                    </div>
                </div>
            ) : (
                licenseStatus === 'WARNING' && (
                    <div className="p-5">
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800 text-sm">
                            <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                            <p>No license exceptions found. A specific license may be required for this shipment.</p>
                        </div>
                    </div>
                )
            )}

            {/* 3. RISK FACTORS */}
            {(dps || uflpa) && (
                <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {dps && <RiskTag type="DPS" level={dps.risk_level} />}
                    {uflpa && <RiskTag type="UFLPA" level={dps.risk_level} />}
                </div>
            )}

            {/* 4. ACTIONS & DOCS */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                        <FileText size={12} />
                        Export Report
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                        <ShieldAlert size={12} />
                        Audit Log
                    </button>
                </div>

                {/* 5. LOGIC TRACE TOGGLE */}
                {trace.length > 0 && (
                    <button
                        onClick={() => setIsTraceOpen(!isTraceOpen)}
                        className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {isTraceOpen ? 'Hide Trace' : 'View Logic'}
                        {isTraceOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                )}
            </div>

            {/* 6. COLLAPSIBLE TRACE */}
            {isTraceOpen && (
                <div className="px-5 py-4 bg-slate-900 text-slate-300 text-xs font-mono border-t border-slate-200 max-h-48 overflow-y-auto">
                    <ul className="space-y-1">
                        {trace.map((line, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-slate-600 opacity-50 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                                <span className={line.includes('ELIGIBLE') ? 'text-emerald-400' : ''}>
                                    {line}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StructuredResponse;
