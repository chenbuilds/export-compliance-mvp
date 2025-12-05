import React, { useState } from 'react';
import Card from './Card';
import { GitCommit, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';

const DecisionVisualization = ({ trace, collapsible = false }) => {
    const [isExpanded, setIsExpanded] = useState(!collapsible);

    if (!trace || trace.length === 0) return null;

    return (
        <div style={{ marginTop: '1rem' }}>
            <div
                onClick={() => collapsible && setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
                    border: '1px solid #e2e8f0',
                    cursor: collapsible ? 'pointer' : 'default',
                    marginBottom: isExpanded ? 0 : 0
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitCommit size={18} color="#2563eb" />
                    <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#334155' }}>
                        Decision Logic Trace
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        padding: '2px 8px',
                        borderRadius: '10px'
                    }}>
                        {trace.length} steps
                    </span>
                </div>
                {collapsible && (
                    isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />
                )}
            </div>

            {isExpanded && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {trace.map((step, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    width: '100%',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        background: '#2563eb',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                    }}>
                                        {index + 1}
                                    </span>
                                    <span style={{ fontSize: '0.9rem', color: '#334155' }}>{step}</span>
                                </div>
                                {index < trace.length - 1 && (
                                    <div style={{ paddingLeft: '18px', paddingBlock: '4px' }}>
                                        <ArrowDown size={12} color="#94a3b8" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DecisionVisualization;
