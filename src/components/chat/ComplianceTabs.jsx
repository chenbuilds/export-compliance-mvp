import React, { useState } from 'react';
import { AlertCircle, CheckCircle, FileText, ShieldAlert, Layers, ExternalLink, ChevronDown } from 'lucide-react';
import ExceptionList from './ExceptionList';
import ScreeningCard from './ScreeningCard';

// Helper for Status Pill
const StatusPill = ({ status, type }) => {
    let colors = 'bg-slate-100 text-slate-600';
    let label = status;

    if (type === 'license') {
        if (status === 'CLEAR') { colors = 'bg-emerald-50 text-emerald-700 border-emerald-100'; label = 'License Exception Eligible'; }
        if (status === 'WARNING') { colors = 'bg-amber-50 text-amber-700 border-amber-100'; label = 'License Verification Needed'; }
        if (status === 'RESTRICTED') { colors = 'bg-red-50 text-red-700 border-red-100'; label = 'License Required'; }
    }

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${colors}`}>
            {type.toUpperCase()}: {label}
        </span>
    );
};


const ComplianceTabs = ({ data }) => {
    // data = full AgentResponse
    const [activeTab, setActiveTab] = useState('exceptions');

    // Extract Risk Items
    const risks = data.screenings?.filter(s =>
        ['MATCH', 'BLOCKED', 'CRITICAL', 'HIGH', 'WARNING', 'SEIZURE_LIKELY'].includes(s.outcome) ||
        ['MATCH', 'BLOCKED', 'CRITICAL', 'HIGH', 'WARNING', 'SEIZURE_LIKELY'].includes(s.risk_level)
    ) || [];

    const hasRisks = risks.length > 0;
    const hasExceptions = data.license_result?.exceptions?.length > 0;

    // Tabs Config
    const tabs = [
        { id: 'exceptions', label: 'Exceptions', icon: Layers, count: data.license_result?.exceptions?.length || 0 },
        { id: 'risks', label: 'Risks', icon: ShieldAlert, count: risks.length, alert: hasRisks },
        { id: 'trace', label: 'Logic Trace', icon: FileText },
        { id: 'docs', label: 'Documents', icon: Download } // Placeholder icon
    ];

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up mt-2">

            {/* 1. Header Area */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-lg text-slate-800 leading-snug">
                        Compliance Analysis Result
                    </h3>
                    <div className="flex gap-2">
                        <StatusPill status={data.license_result?.status || 'UNKNOWN'} type="license" />
                        {hasRisks && <StatusPill status="DETECTED" type="risk" />}
                    </div>
                </div>
                {/* Summary (if distinct from main message, but main message is usually outside. 
                    If we want summary INSIDE, we assume 'message' is passed here. 
                    For now, we rely on the implementation plan saying "Composite Bubble: Summary + ...". 
                    So we can render the text here or assume it's above. 
                    Let's render a mini-summary if available, otherwise just tabs.) */}
            </div>

            {/* 2. Tabs Navigation */}
            <div className="flex items-center gap-1 px-2 bg-slate-50/50 border-b border-slate-200 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-700 bg-indigo-50/30'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                        `}
                    >
                        <tab.icon size={16} className={tab.alert ? 'text-red-500' : ''} />
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab.alert ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* 3. Tab Content */}
            <div className="p-5 min-h-[200px] bg-slate-50/50">

                {/* EXCEPTIONS TAB */}
                {activeTab === 'exceptions' && (
                    hasExceptions ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.license_result.exceptions.map((ex, i) => (
                                <div key={i} className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all p-4 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-800 text-lg">{ex.code}</span>
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold uppercase">Eligible</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">{ex.description}</p>
                                    <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-xs text-slate-400 font-mono">EAR §740.x</span>
                                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                            Verify <ExternalLink size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <Layers size={32} className="mx-auto mb-3 opacity-20" />
                            <p>No specific exceptions identified for this classification.</p>
                        </div>
                    )
                )}

                {/* RISKS TAB */}
                {activeTab === 'risks' && (
                    hasRisks ? (
                        <div className="space-y-4">
                            {risks.map((risk, i) => (
                                <ScreeningCard key={i} data={risk} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <CheckCircle size={48} className="text-emerald-100 mb-4" />
                            <p className="text-slate-600 font-medium">No Screening Risks Detected</p>
                            <p className="text-sm">Denied Party and Forced Labor screenings came back clear.</p>
                        </div>
                    )
                )}

                {/* TRACE TAB */}
                {activeTab === 'trace' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {data.license_result?.reasoning ? (
                            <ol className="relative border-l border-slate-200 ml-3 space-y-6">
                                {data.license_result.reasoning.map((step, i) => (
                                    <li key={i} className="mb-2 ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-50 rounded-full -left-3 ring-4 ring-white text-xs font-bold text-indigo-600">
                                            {i + 1}
                                        </span>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-sm text-slate-700">{step}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-slate-400 italic">No detailed trace available.</p>
                        )}
                    </div>
                )}

                {/* DOCS TAB */}
                {activeTab === 'docs' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left flex items-start gap-3 group">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Download size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">Compliance Report</h4>
                                <p className="text-xs text-slate-500 mt-1">Full PDF analysis including ECCN logic and screening results.</p>
                            </div>
                        </button>
                        <button className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left flex items-start gap-3 group">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-emerald-700">Audit Log</h4>
                                <p className="text-xs text-slate-500 mt-1">JSON record of decision nodes for internal auditing.</p>
                            </div>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

// Simple icon placeholder
const Download = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);


export default ComplianceTabs;
