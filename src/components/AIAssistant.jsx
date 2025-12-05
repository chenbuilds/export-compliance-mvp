import React, { useState } from 'react';
import { Bot, Sparkles, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const AIAssistant = ({ suggestion }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!suggestion) return null;

    return (
        <div style={{
            marginTop: '20px',
            marginBottom: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
            border: '2px solid #2563eb',
            fontFamily: 'var(--font-sans)',
            overflow: 'hidden',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#fff',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={20} />
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>AI Insight</span>
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {isExpanded && (
                <div style={{ padding: '18px' }}>
                    <p style={{
                        lineHeight: '1.6',
                        color: '#1e293b',
                        fontSize: '0.95rem',
                        margin: 0,
                        marginBottom: '12px'
                    }}>
                        {suggestion}
                    </p>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <ExternalLink size={14} color="#64748b" />
                        <a
                            href="https://www.bis.doc.gov/index.php/regulations/export-administration-regulations-ear"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '0.8rem',
                                color: '#64748b',
                                textDecoration: 'underline'
                            }}
                        >
                            View EAR Regulations (BIS.gov)
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
