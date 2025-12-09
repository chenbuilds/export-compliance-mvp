import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';

const RequirementsPack = ({ missingItems, onAction, data }) => {
    // missingItems: [{ field: 'destination', label: 'Destination' }, ...]
    // data can carry title/intro overrides from backend

    const isOptionalUpdate = data?.isOptional || false;
    const title = data?.title || (isOptionalUpdate ? "Refine Assessment" : "Additional Details Required");
    const headerColor = isOptionalUpdate ? "bg-indigo-50/50 border-indigo-100 text-indigo-700" : "bg-rose-50/50 border-rose-100 text-rose-700";
    const iconColor = isOptionalUpdate ? "text-indigo-600" : "text-rose-600";
    const borderColor = isOptionalUpdate ? "border-indigo-100 shadow-indigo-50/50" : "border-rose-100 shadow-rose-50/50";

    const [formValues, setFormValues] = React.useState({});

    const handleFormChange = (field, value) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

    const handleFormSubmit = () => {
        const parts = Object.entries(formValues).map(([key, val]) => {
            if (!val) return null;
            const label = key.replace(/_/g, ' ');
            return `${label} is ${val}`;
        }).filter(Boolean);

        if (parts.length > 0) {
            onAction(parts.join(' and '));
        }
    };

    if (missingItems && missingItems.length > 1) {
        return (
            <div className={`w-full max-w-2xl bg-white border ${borderColor} rounded-xl shadow-lg overflow-hidden animate-fade-in-up`}>
                {/* Header */}
                <div className={`${headerColor} px-4 py-3 border-b flex items-center gap-2`}>
                    <AlertCircle size={18} className={iconColor} />
                    <span className="font-semibold text-sm">{title}</span>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    <p className="text-sm text-slate-600 mb-1">
                        {isOptionalUpdate
                            ? "You can add any specific details below to refine the compliance check. All fields are optional."
                            : <span>To ensure a complete check, please provide the details below. Fields marked with <span className="text-rose-500 font-bold">*</span> are required.</span>
                        }
                    </p>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex gap-2 items-start mb-2">
                        <span className="text-indigo-500 mt-0.5">ℹ️</span>
                        <p className="text-xs text-indigo-800 font-medium">
                            <strong>Pro Tip:</strong> Filling out optional fields (Value, End Use) significantly improves accuracy by enabling License Exception checks.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(missingItems || []).map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">
                                    {item.label} {item.required ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal lowercase">(optional)</span>}
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${item.required ? 'border-slate-300 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/50'}`}
                                    placeholder={item.required ? `Enter ${item.label}...` : `Enter ${item.label} (Optional)...`}
                                    onChange={(e) => handleFormChange(item.field, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            onClick={handleFormSubmit}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95"
                        >
                            Update Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default "Chips" view for single item or simple cases
    return (
        <div className="w-full max-w-2xl bg-white border border-rose-100 rounded-xl shadow-lg shadow-rose-50/50 overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-rose-50/50 px-4 py-3 border-b border-rose-100 flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-500" />
                <span className="font-semibold text-rose-700 text-sm">Action Required</span>
            </div>

            {/* List */}
            <div className="p-4 flex flex-col gap-3">
                <p className="text-sm text-slate-600 mb-1">
                    The following details are needed to complete the assessment:
                </p>

                <div className="flex flex-wrap gap-2">
                    {(missingItems || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg group hover:border-indigo-300 transition-colors cursor-default">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Adaptive Chips */}
                <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-slate-50">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Inputs</span>
                    <div className="flex flex-wrap gap-2">
                        {/* Simplified Adaptive Chips */}
                        {(missingItems || []).map((item, idx) => {
                            if (!item || !item.field) return null;
                            const f = item.field.toLowerCase();
                            let action = `Set ${item.field}`;

                            // Simple heuristics without complex logic for stability
                            if (f.includes('destination')) {
                                return (
                                    <React.Fragment key={idx}>
                                        <button onClick={() => onAction("Destination is China")} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:bg-slate-50">China</button>
                                        <button onClick={() => onAction("Destination is Germany")} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:bg-slate-50">Germany</button>
                                    </React.Fragment>
                                )
                            }
                            if (f.includes('value')) {
                                return <button key={idx} onClick={() => onAction("Value is $5000")} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:bg-slate-50">$5,000</button>
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => onAction(action)}
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:bg-slate-50"
                                >
                                    <Plus size={12} className="inline mr-1" /> {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequirementsPack;
