import React from 'react';
import { Search, Shield, FileText, Upload, AlertCircle } from 'lucide-react';

const ToolChip = ({ icon: Icon, label, onClick, highlight = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium
        ${highlight
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm hover:bg-blue-100'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
    >
        <Icon size={14} className={highlight ? 'text-blue-500' : 'text-slate-400'} />
        {label}
        {highlight && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1"></span>}
    </button>
);

const RecommendedTools = ({ usageStats = {}, onAction }) => {
    // Simple heuristic
    const stats = usageStats || {};
    const showLicense = (stats.licenseChecks || 0) >= 2;
    const showScreening = (stats.entityScreening || 0) >= 2;

    return (
        <div className="w-full max-w-2xl mt-6 animate-fade-in-up flex flex-wrap justify-center gap-3">
            <ToolChip
                icon={Search}
                label="License Check"
                highlight={showLicense}
                onClick={() => onAction("Check for license requirements")}
            />

            <ToolChip
                icon={Shield}
                label="Entity Screening"
                highlight={showScreening}
                onClick={() => onAction("Run denied party screening")}
            />

            <ToolChip
                icon={AlertCircle}
                label="Forced Labor Check"
                onClick={() => onAction("Check supplier for UFLPA risk")}
            />

            <ToolChip
                icon={Upload}
                label="Analyze Document"
                onClick={() => onAction("Analyze text from a document")}
            />

            <ToolChip
                icon={FileText}
                label="Generate Report"
                onClick={() => onAction("Draft a compliance report")}
            />
        </div>
    );
};

export default RecommendedTools;
