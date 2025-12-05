import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle, Loader2, Shield, Lock, FileText, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

/**
 * ChatInterface - Enhanced ChatGPT-like multi-turn conversation component
 */
const ChatInterface = ({ formContext, onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your Export Compliance Assistant. I can help you with:\n\n• ECCN classification\n• License exception eligibility\n• Destination screening\n• Regulatory guidance\n\nWhat would you like to know?",
            type: 'welcome'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [expandedMessages, setExpandedMessages] = useState({});
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleExpand = (idx) => {
        setExpandedMessages(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: userMessage,
                    context: formContext || {}
                })
            });

            const data = await response.json();
            setSessionId(data.session_id);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response,
                type: 'insight'
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting. Please try again.",
                type: 'error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestedQuestions = [
        "What is ECCN 5A002?",
        "Can I use STA for Germany?",
        "What's the LVS threshold?"
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '420px',
            height: '560px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.2)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>Compliance AI</div>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>Always here to help</div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        color: 'white', cursor: 'pointer', padding: '8px',
                        borderRadius: '8px', display: 'flex'
                    }}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#f8fafc'
            }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            gap: '8px'
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Bot size={18} color="white" />
                            </div>
                        )}
                        <div style={{
                            maxWidth: '80%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#ffffff',
                            color: msg.role === 'user' ? 'white' : '#1e293b',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            boxShadow: msg.role === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.content}

                            {/* Expandable hint for long messages */}
                            {msg.content.length > 200 && (
                                <button
                                    onClick={() => toggleExpand(idx)}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#2563eb', fontSize: '12px',
                                        cursor: 'pointer', marginTop: '8px',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    {expandedMessages[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {expandedMessages[idx] ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: '#64748b', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <User size={18} color="white" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Loader2 size={18} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                        <div style={{
                            padding: '12px 16px', borderRadius: '16px',
                            background: '#ffffff', color: '#64748b',
                            fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            Thinking...
                        </div>
                    </div>
                )}

                {/* Suggested questions for empty state */}
                {messages.length === 1 && (
                    <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                            Quick questions:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(q); }}
                                    style={{
                                        padding: '6px 12px', borderRadius: '20px',
                                        background: '#e2e8f0', border: 'none',
                                        fontSize: '12px', color: '#475569',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                gap: '10px'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about export compliance..."
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                        opacity: isLoading || !input.trim() ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

/**
 * ChatToggle - Enhanced floating button with pulse animation
 */
export const ChatToggle = ({ onClick }) => (
    <button
        onClick={onClick}
        className="chat-toggle-btn"
        title="Chat with AI Assistant"
        style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 40px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'transform 0.2s, box-shadow 0.2s'
        }}
    >
        <MessageCircle size={28} />
    </button>
);

export default ChatInterface;
