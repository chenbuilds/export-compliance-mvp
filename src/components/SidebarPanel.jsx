import React from 'react';
import { X, FileText, Activity, Download, List } from 'lucide-react';

const SidebarPanel = ({ isOpen, onClose, data }) => {
    // data = full agent response or context
    // We'll extract what we need


    return (
        <div className={`
            h-full bg-white border-l border-slate-200 shadow-xl z-20 transform transition-all duration-300 ease-in-out font-sans flex flex-col flex-shrink-0
            ${isOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full opacity-0 overflow-hidden'}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 min-w-[320px]">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <List size={18} className="text-slate-400" />
                    Shipment Details
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* 1. Quick Stats / ID */}
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-xs text-slate-500 font-medium">ECCN</span>
                            <span className="text-xs font-mono font-bold text-slate-700">{data?.eccn || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-slate-500 font-medium">Destination</span>
                            <span className="text-xs font-mono font-bold text-slate-700">{data?.destination || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-slate-500 font-medium">Value</span>
                            <span className="text-xs font-mono font-bold text-slate-700">{data?.value ? `$${data.value}` : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Actions */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</label>
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-slate-50 transition-all shadow-sm text-left group">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Download size={18} />
                        </div>
                        <div>
                            <span className="block text-sm font-semibold text-slate-700">Export Report</span>
                            <span className="block text-xs text-slate-400">PDF & JSON formats</span>
                        </div>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-slate-50 transition-all shadow-sm text-left group">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <FileText size={18} />
                        </div>
                        <div>
                            <span className="block text-sm font-semibold text-slate-700">Audit Log</span>
                            <span className="block text-xs text-slate-400">View transaction history</span>
                        </div>
                    </button>
                </div>

                {/* 3. Full Decision Trace Info (Placeholder for now) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} /> Full Decision Trace
                    </label>
                    <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 border-dashed">
                        Full reasoning documentation and rule references are available in the downloadable report.
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
                    View System Status
                </button>
            </div>

        </div>
    );
};

export default SidebarPanel;
