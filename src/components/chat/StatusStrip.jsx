import React from 'react';
import { CheckCircle, AlertTriangle, ShieldAlert, AlertCircle, ShieldCheck } from 'lucide-react';

const StatusStrip = ({ licenseStatus, dpsStatus, uflpaStatus }) => {
    // Helper for visual config
    const getStatusConfig = (status, type) => {
        const s = (status || '').toUpperCase();
        if (s.includes('BLOCKED') || s.includes('CRITICAL') || s.includes('REQUIRED') || s.includes('SEIZURE')) {
            return { color: 'text-red-600 bg-red-50 border-red-100', icon: ShieldAlert, label: status || 'High Risk' };
        }
        if (s.includes('WARNING') || s.includes('HIGH') || s.includes('ELEVATED')) {
            return { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: AlertTriangle, label: status || 'Warning' };
        }
        if (s.includes('EXCEPTION') || s.includes('NLR') || s === 'CLEAR' || s === 'LOW') {
            return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle, label: status || 'Clear' };
        }
        return { color: 'text-slate-500 bg-slate-50 border-slate-100', icon: AlertCircle, label: status || 'Not Checked' };
    };

    const lic = getStatusConfig(licenseStatus, 'license');
    const dps = getStatusConfig(dpsStatus, 'dps');
    const ufl = getStatusConfig(uflpaStatus, 'uflpa');

    return (
        <div className="flex flex-wrap gap-2 w-full max-w-2xl mt-1 animate-fade-in-up">
            {/* License Status */}
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border flex-1 min-w-[140px] shadow-sm transition-colors ${lic.color}`}>
                <lic.icon size={18} strokeWidth={2} />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">License</span>
                    <span className="text-sm font-semibold leading-tight">{lic.label}</span>
                </div>
            </div>

            {/* DPS Status */}
            {dpsStatus && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm transition-colors ${dps.color}`}>
                    <dps.icon size={18} />
                    <span className="text-sm font-semibold">DPS: {dps.label}</span>
                </div>
            )}

            {/* UFLPA Status */}
            {uflpaStatus && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm transition-colors ${ufl.color}`}>
                    <ufl.icon size={18} />
                    <span className="text-sm font-semibold">UFLPA: {ufl.label}</span>
                </div>
            )}
        </div>
    );
};

export default StatusStrip;
