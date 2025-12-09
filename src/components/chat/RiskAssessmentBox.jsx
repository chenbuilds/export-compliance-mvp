import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, CheckCircle2, Ban, ShieldAlert } from 'lucide-react';

const RiskRow = ({ label, result }) => {
    // result: { outcome: 'CLEAR'|'WARNING'|'MATCH'|'UNKNOWN', risk_level: '...' }

    let statusColor = "bg-slate-100 text-slate-500 border-slate-200";
    let icon = <HelpCircle size={16} />;
    let statusText = "UNKNOWN";

    if (result) {
        // Normalize status
        const outcome = result.outcome || "UNKNOWN";

        if (outcome === 'CLEAR') {
            statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
            icon = <CheckCircle2 size={16} />;
            statusText = "CLEAR";
        } else if (outcome === 'WARNING') {
            statusColor = "bg-amber-100 text-amber-700 border-amber-200";
            icon = <AlertTriangle size={16} />;
            statusText = "WARNING";
        } else if (outcome === 'MATCH' || outcome === 'BLOCKED') {
            statusColor = "bg-rose-100 text-rose-700 border-rose-200";
            icon = <Ban size={16} />;
            statusText = "FLAGGED";
        } else if (outcome === 'UNKNOWN' || outcome === 'NOT_RUN') {
            statusColor = "bg-slate-100 text-slate-500 border-slate-200";
            icon = <HelpCircle size={16} />;
            statusText = "UNKNOWN";
        }
    }

    return (
        <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-1 rounded-lg">
            <div className="col-span-4 font-medium text-slate-700 text-sm flex items-center gap-2">
                {label}
            </div>
            <div className="col-span-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                    {icon}
                    {statusText}
                </span>
            </div>
            <div className="col-span-5 text-xs text-slate-500 leading-tight">
                {result?.reasoning?.[0] || "Data missing for screening."}
            </div>
        </div>
    );
};

const RiskAssessmentBox = ({ data }) => {
    // data: { dps: {}, uflpa: {}, sanctions: {} }
    const { dps, uflpa, sanctions } = data || {};

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 animate-fade-in-up mt-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert size={16} className="text-slate-400" />
                Risk Assessment
            </h4>

            <div className="flex flex-col">
                <RiskRow label="Denied Parties (DPS)" result={data?.dps} />
                <RiskRow label="Forced Labor (UFLPA)" result={data?.uflpa} />
                <RiskRow label="Sanctions & Embargoes" result={data?.sanctions} />
            </div>
        </div>
    );
};

export default RiskAssessmentBox;
