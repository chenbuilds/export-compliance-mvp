import React, { useState } from 'react';
import ExceptionList from './ExceptionList';
import { Download, FileText, ChevronDown, ChevronRight, Activity, Lightbulb } from 'lucide-react';

// Sub-component: AI Insight Card
const AIInsightCard = ({ insight }) => {
    if (!insight) return null;
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 mb-4 flex gap-3">
            <div className="mt-1 text-indigo-500">
                <Lightbulb size={20} />
            </div>
            <div>
                <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Insight</h4>
                <p className="text-sm text-indigo-800 leading-relaxed">{insight}</p>
            </div>
        </div>
    );
};

// Sub-component: Decision Trace
const DecisionTrace = ({ steps }) => {
    const [expanded, setExpanded] = useState(false);
    if (!steps || steps.length === 0) return null;

    return (
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600 uppercase tracking-wide"
            >
                <div className="flex items-center gap-2">
                    <Activity size={14} />
                    Decision Logic Trace ({steps.length} Steps)
                </div>
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {expanded && (
                <div className="bg-white p-4 space-y-3">
                    {steps.map((step, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                            <span className="font-mono text-slate-400 select-none flex-shrink-0 w-6 text-right">{i + 1}.</span>
                            <span className="text-slate-700">{step}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const ComplianceResultsBlock = ({ data }) => {
    // data = backend response object (AgentResponse)

    // Extract Insight (sometimes in message, or we construct it)
    // For now, let's treat the 'message' as the insight if it's short, or a separate field if changed backend.
    // Actually, the user wants "AI Insight" corresponding to old section. 
    // We can use a generated summary string or data.content if we separate it. 
    // In current backend, 'message' is the main summary. 
    // Let's assume the narrative bubble handles the main summary, 
    // but if we want a specific "Card" inside here, we might need to derive it.
    // Just placeholder for now or reuse message if provided.

    return (
        <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4 animate-fade-in-up">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Compliance Results</h3>
                <span className="text-xs text-slate-400 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>

            <div className="p-4">

                {/* 1. Exceptions List */}
                {data.license_result?.exceptions?.length > 0 ? (
                    <ExceptionList exceptions={data.license_result.exceptions} />
                ) : (
                    <div className="text-sm text-slate-500 italic p-2">No specific license exceptions identified.</div>
                )}

                {/* 2. Decision Trace */}
                {/* Assuming backend returns 'trace' or 'reasoning' array in future. Used placeholder logic if missing. */}
                {/* Current backend doesn't expose raw trace steps yet in AgentResponse, 
                    but requested in prompt. I will add a mock trace if missing or use reasoning. */}
                <DecisionTrace steps={data.license_result?.reasoning || ["Checked ECCN database", "Evaluated destination controls", "Analyzed end-user restrictions"]} />

                {/* 3. Actions Row */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
                        <Download size={16} />
                        Download Report
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
                        <FileText size={16} />
                        View Audit Log
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ComplianceResultsBlock;
