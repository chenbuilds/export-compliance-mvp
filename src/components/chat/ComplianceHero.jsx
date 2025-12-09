import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

const ComplianceHero = ({ data }) => {
    // data: { status: "RESTRICTED"|"CLEAN"|"WARNING"|"BLOCKED", risk_level: "LOW"|"HIGH"|"CRITICAL", summary: "..." }
    const { status, risk_level, summary } = data;

    const getColors = () => {
        switch (risk_level) {
            case 'CRITICAL': return 'bg-red-50 border-red-200 text-red-800';
            case 'HIGH': return 'bg-amber-50 border-amber-200 text-amber-800';
            default: return 'bg-emerald-50 border-emerald-200 text-emerald-800';
        }
    };

    const getIcon = () => {
        switch (risk_level) {
            case 'CRITICAL': return <AlertOctagon size={24} className="text-red-600" />;
            case 'HIGH': return <ShieldAlert size={24} className="text-amber-600" />;
            default: return <ShieldCheck size={24} className="text-emerald-600" />;
        }
    };

    return (
        <div className={`p-4 rounded-xl border ${getColors()} flex items-center gap-4 mb-4`}>
            <div className="p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                {getIcon()}
            </div>
            <div>
                <h3 className="font-bold text-lg">{status}</h3>
                <p className="text-sm opacity-90">{summary}</p>
            </div>
            <div className="ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/50 border border-white/20">
                RISK: {risk_level}
            </div>
        </div>
    );
};

export default ComplianceHero;
