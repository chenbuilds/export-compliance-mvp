import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldBan } from 'lucide-react';

const VerdictCard = ({ data }) => {
    const { status, risk_level, summary } = data;

    let config = {
        icon: ShieldCheck,
        bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        shadow: "shadow-emerald-200",
        title: "Clean",
        desc: "No license required or exception available."
    };

    if (status === 'RESTRICTED' || status === 'WARNING') {
        config = {
            icon: ShieldAlert,
            bg: "bg-gradient-to-br from-amber-500 to-amber-600",
            shadow: "shadow-amber-200",
            title: "Review Required",
            desc: "License required or potential risk warning."
        };
    }

    if (status === 'BLOCKED') {
        config = {
            icon: ShieldBan,
            bg: "bg-gradient-to-br from-rose-600 to-rose-700",
            shadow: "shadow-rose-200",
            title: "Restricted",
            desc: "Prohibited destination or denied party match."
        };
    }

    const Icon = config.icon;

    return (
        <div className={`w-full max-w-2xl rounded-2xl p-6 text-white shadow-xl ${config.shadow} ${config.bg} relative overflow-hidden animate-fade-in-up mb-4`}>
            {/* Abstract Shapes */}
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-black/5 rounded-full blur-xl" />

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1 opacity-90">
                        <span className="text-xs font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
                            Verdict
                        </span>
                        <span className="text-xs font-medium opacity-75">{risk_level} Risk</span>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight mb-2">{config.title}</h3>
                    <p className="text-white/90 font-medium text-sm max-w-md">{summary}</p>
                    <p className="text-white/70 text-xs mt-1">{config.desc}</p>
                </div>

                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                    <Icon size={32} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
};

export default VerdictCard;
