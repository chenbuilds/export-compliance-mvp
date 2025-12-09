import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ComplianceHero from './ComplianceHero';
import ExceptionCardGrid from './ExceptionCardGrid';
import RiskAssessmentBox from './RiskAssessmentBox';
import LogicTrace from './LogicTrace';
import OptimizationTip from './OptimizationTip';
import ActionButtons from './ActionButtons';
import ClarificationChips from './ClarificationChips';
import RequirementsPack from './RequirementsPack';
import VerdictCard from './VerdictCard';

const AgentMessage = ({ message, onAction, context = {} }) => {
    const isUser = message.role === 'user';

    // 1. User Message (Always text)
    if (isUser) {
        return (
            <div className="flex flex-row-reverse gap-4 animate-fade-in-up mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                    <User size={18} />
                </div>
                <div className="max-w-[85%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed">
                    {message.content}
                </div>
            </div>
        );
    }

    // 2. Assistant Messages
    const { kind, content, data } = message;

    // A. Text Bubble (Short Narrative)
    if (kind === 'text') {
        return (
            <div className="flex gap-4 animate-fade-in-up mb-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Bot size={18} />
                </div>
                {/* Larger Text for Narrative Impact */}
                <div className="max-w-[85%] bg-white border border-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm text-base font-medium leading-relaxed">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        );
    }

    // B. Structured Blocks (No Bubble, Direct Render)
    const renderBlock = () => {
        switch (kind) {
            case 'confirmation_chips':
                return (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(data?.chips || []).map((chip, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {chip.label} ✓
                            </span>
                        ))}
                    </div>
                );

            // ...

            case 'requirements_pack': return <RequirementsPack missingItems={data?.missing_items} onAction={onAction} />;
            case 'optimization_tip': return <OptimizationTip data={data} onAction={onAction} />;
            case 'verdict_card': return <VerdictCard data={data} />;
            case 'compliance_hero': return <VerdictCard data={data} />; // Legacy fallback to new card
            case 'exception_grid': return <ExceptionCardGrid data={data} />;
            case 'risk_box': return <RiskAssessmentBox data={data} />;
            case 'logic_trace': return <LogicTrace data={data} />;
            case 'next_steps': return <ActionButtons data={data} context={context} />;
            case 'clarification': return <ClarificationChips missingFields={data?.missing_fields} onAction={onAction} />;
            default: return null;
        }
    };

    if (kind !== 'text') {
        return (
            <div className="flex gap-4 animate-fade-in-up mb-2">
                <div className="w-8 flex-shrink-0" /> {/* Spacer alignment */}
                <div className="w-full max-w-[85%]">
                    {renderBlock()}
                </div>
            </div>
        );
    }

    return null;
};

export default AgentMessage;
