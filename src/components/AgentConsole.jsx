import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Sparkles, RefreshCw, Paperclip, AlertOctagon, LayoutDashboard } from 'lucide-react';
import { runAgentChat } from '../api/agentClient';
import { API_URL } from '../config/api';
import AIOrb from './AIOrb';
import SidebarPanel from './SidebarPanel';
import RecommendedTools from './RecommendedTools';
import AgentMessage from './chat/AgentMessage';
import { useUsageStats } from '../hooks/useUsageStats';

import ProgressTracker from './chat/ProgressTracker';

const AgentConsole = () => {
    // 1. Core State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isAgentThinking, setIsAgentThinking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mood, setMood] = useState('idle');
    const { stats, increment } = useUsageStats(); // Hook

    // Restoring missing state for Sidebar/Context
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [lastAgentResponse, setLastAgentResponse] = useState(null);

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    // -- ADAPTIVE UX: LocalStorage Persistence --
    useEffect(() => {
        // Load recent cases on mount
        const savedCases = localStorage.getItem('exportshield_recent_cases');
        if (savedCases) {
            // In a real app, we'd populate a "Recent" list. 
            // For now, we log it or could use it to seed autocomplete.
            console.log("Loaded recent cases:", JSON.parse(savedCases));
        }
    }, []);

    const saveToHistory = (data) => {
        if (!data.eccn || !data.destination) return;
        const history = JSON.parse(localStorage.getItem('exportshield_recent_cases') || '[]');
        const newEntry = { eccn: data.eccn, dest: data.destination, date: new Date().toISOString() };
        // Avoid duplicates
        const isDup = history.some(h => h.eccn === newEntry.eccn && h.dest === newEntry.dest);
        if (!isDup) {
            localStorage.setItem('exportshield_recent_cases', JSON.stringify([newEntry, ...history].slice(0, 5)));
        }
    };

    useEffect(() => {
        if (formData.eccn && formData.destination) {
            saveToHistory(formData);
        }
    }, [formData]);

    const handleChatSubmit = async (overrideInput = null) => {
        const query = overrideInput || input;
        if (!query.trim()) return;

        // Optimistic UI
        const userMsg = { role: 'user', content: query, kind: 'text' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setMood('thinking');
        setIsAgentThinking(true);

        // Track usage (heuristic)
        if (query.toLowerCase().includes('license') || query.toLowerCase().includes('eccn')) increment('licenseChecks');
        if (query.toLowerCase().includes('screen') || query.toLowerCase().includes('party')) increment('entityScreening');
        if (query.toLowerCase().includes('uflpa') || query.toLowerCase().includes('labor')) increment('forcedLabor');

        try {
            // Actual API Call
            // Fix: Pass full history, not just query string
            // We also pass the current formData (context) so the backend knows what we already have
            const response = await runAgentChat([...messages, userMsg], formData);

            if (response && response.messages) {
                setMessages(prev => [...prev, ...response.messages]);
                if (response.mood) setMood(response.mood);

                // CRITICAL: Update State from Backend
                if (response.shipment) setFormData(response.shipment);
                setLastAgentResponse(response);
            }
        } catch (error) {
            console.error("Agent Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', kind: 'text', content: "I encountered an error connecting to the decision engine. Please try again." }]);
            setMood('tired');
        } finally {
            setLoading(false);
            setIsAgentThinking(false);
        }
    };

    const handleReset = () => {
        setMessages([]);
        setMood('idle');
        setFormData({});
        setLastAgentResponse(null);
    };

    const isLanding = messages.length === 0;
    const IS_ADMIN = true; // Env flag mock

    // Derive Progress State
    const progressSteps = {
        identified: !!formData.eccn,
        destination: !!formData.destination,
        value: !!formData.value,
        analysis: !!lastAgentResponse && (!lastAgentResponse.missing_fields || lastAgentResponse.missing_fields.length === 0) && lastAgentResponse.intent !== 'general_qa'
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* Background Gradients */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            {/* Navbar / Header */}
            <header className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 transition-all duration-300 ${isLanding ? 'bg-white/50 backdrop-blur-md border-b border-white/20' : 'bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm'}`}>
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={handleReset}
                    title="Reset Session"
                >
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                        <Sparkles size={18} />
                    </div>
                    <span className="font-bold text-slate-800 tracking-tight ml-1 text-lg">ExportShield</span>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 ml-2">ENTERPRISE</span>
                </div>

                <div className="flex items-center gap-4">
                    {IS_ADMIN && (
                        <a href="/admin" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                            <LayoutDashboard size={14} />
                            Dashboard
                        </a>
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="User" />
                    </div>
                </div>
            </header>

            {/* CONTENT WRAPPER (Row Layout) */}
            <div className="flex flex-1 relative z-10 overflow-hidden pt-16">

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 flex flex-col relative min-w-0">

                    {/* 1. LANDING STATE */}
                    {isLanding && (
                        <div className="w-full min-h-full flex flex-col justify-center items-center animate-fade-in relative z-20">
                            {/* Orb */}
                            <div className="mb-8 scale-110">
                                <AIOrb mood={mood} />
                            </div>

                            <div className="w-full max-w-2xl px-6 flex flex-col items-center gap-8 relative z-30">
                                <div className="text-center mb-4 relative">
                                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2 drop-shadow-sm">ExportShield Intelligence</h2>
                                    <p className="text-slate-500 text-lg font-medium">Enterprise Export Compliance & Screening</p>
                                </div>

                                {/* GLASSMORPHIC HERO CARD */}
                                <div className="w-full p-1 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-white/50 relative z-30 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all duration-300">
                                    <div className="relative bg-white/80 rounded-[1.8rem] flex items-center">
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleChatSubmit(); }}
                                            placeholder="Describe shipment, check license, or screen party..."
                                            className="w-full pl-8 pr-16 py-5 rounded-[1.8rem] border-none text-lg bg-transparent placeholder-slate-400 text-slate-800 focus:outline-none"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleChatSubmit()}
                                            disabled={!input.trim()}
                                            className="absolute right-2 p-3 bg-indigo-600 rounded-full text-white hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/30"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Adaptive Pills */}
                                <div className="w-full relative z-30 flex justify-center">
                                    <RecommendedTools usageStats={stats} onAction={handleChatSubmit} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. CHAT STREAM (Left Zone) */}
                    {!isLanding && (
                        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6 pb-40 overflow-y-auto h-full scroll-smooth">

                            {/* Progress Tracker (Sticky Top) */}
                            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur py-2 border-b border-slate-100 mb-4 transition-all">
                                <ProgressTracker steps={progressSteps} />
                            </div>

                            {messages.map((m, i) => (
                                <AgentMessage
                                    key={i}
                                    message={m}
                                    onAction={handleChatSubmit}
                                    context={{ ...formData, ...lastAgentResponse?.shipment }} // Pass full context for actions
                                />
                            ))}

                            {isAgentThinking && (
                                <div className="flex items-center gap-3 text-slate-400 text-sm pl-4 animate-pulse">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                    <span className="font-medium tracking-wide">Analyzing compliance data...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-8" />
                        </div>
                    )}
                </main>

                {/* RIGHT ZONE: SIDEBAR */}
                <SidebarPanel
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    data={{ ...formData, ...lastAgentResponse }}
                />

            </div>

            {/* BOTTOM INPUT (Fixed in Chat Mode) */}
            {!isLanding && (
                <div className={`fixed bottom-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-6 z-40 transition-all duration-300 ${isSidebarOpen ? 'w-[calc(100%-24rem)]' : 'w-full'}`}>
                    <div className="w-full max-w-4xl mx-auto relative flex justify-center">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }}
                            placeholder="Type to reply..."
                            disabled={isAgentThinking}
                            className="w-full pl-6 pr-16 py-4 rounded-2xl border border-slate-300 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 shadow-lg shadow-slate-200/50 resize-none outline-none transition-all text-base"
                            style={{ minHeight: '64px', maxHeight: '200px' }} // Auto-expand logic handled by browser or simple css usually needs js for true auto-grow, but sticking to simple valid css
                        />
                        <button
                            onClick={() => handleChatSubmit()}
                            disabled={!input.trim() || isAgentThinking}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:shadow-none"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentConsole;
