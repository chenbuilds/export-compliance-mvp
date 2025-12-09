import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

const ProgressTracker = ({ steps }) => {
    // Expected steps: { identified: bool, destination: bool, value: bool, analysis: bool }

    const Step = ({ label, isCompleted, isActive }) => {
        let color = "text-slate-400";
        let icon = <Circle size={14} />;
        let bg = "bg-slate-100";
        let border = "border-slate-200";

        if (isCompleted) {
            color = "text-emerald-600";
            icon = <CheckCircle2 size={16} className="text-emerald-500" />;
            bg = "bg-emerald-50";
            border = "border-emerald-200";
        } else if (isActive) {
            color = "text-indigo-600";
            icon = <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />;
            bg = "bg-indigo-50";
            border = "border-indigo-200";
        }

        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${border} ${bg} transition-all duration-300`}>
                <div className="flex items-center justify-center w-4 h-4">
                    {icon}
                </div>
                <span className={`text-xs font-semibold ${color} whitespace-nowrap`}>{label}</span>
            </div>
        );
    };

    const Separator = () => (
        <ArrowRight size={12} className="text-slate-300" />
    );

    return (
        <div className="w-full flex items-center justify-center gap-2 py-4 animate-fade-in-up">
            <Step label="Identify Item" isCompleted={steps.identified} isActive={!steps.identified} />
            <Separator />
            <Step label="Destination" isCompleted={steps.destination} isActive={steps.identified && !steps.destination} />
            <Separator />
            <Step label="Value" isCompleted={steps.value} isActive={steps.identified && steps.destination && !steps.value} />
            <Separator />
            <Step label="Analysis" isCompleted={steps.analysis} isActive={steps.identified && steps.destination && steps.value && !steps.analysis} />
        </div>
    );
};

export default ProgressTracker;
