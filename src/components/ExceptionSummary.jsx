import React, { useState } from 'react';
import {
    ChevronDown, ChevronUp, FileText, Globe, Lock, Shield, Clock,
    Settings, Cpu, Building, Briefcase, Plane, CheckCircle, AlertCircle,
    Info, ExternalLink, Filter, Map
} from 'lucide-react';
import Button from './Button';

// Icon mapping for exception types
const EXCEPTION_ICONS = {
    'LVS': FileText,
    'STA': Globe,
    'ENC': Lock,
    'GOV': Shield,
    'TMP': Clock,
    'GBS': Globe,
    'TSR': Settings,
    'RPL': Settings,
    'APP': Cpu,
    'CIV': Building,
    'BAG': Briefcase,
    'AVS': Plane,
    'NLR': CheckCircle,
    'IVL': AlertCircle,
    'TIP': Info,
    'EMBARGO': AlertCircle,
};

// Color mapping for exception types
const EXCEPTION_COLORS = {
    'EXCEPTION': { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
    'LICENSE_REQUIRED': { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
    'TIP': { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    'NLR': { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
};

// Regulatory links
const REG_LINKS = {
    'LVS': { section: '§740.3', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.3' },
    'STA': { section: '§740.20', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.20' },
    'ENC': { section: '§740.17', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.17' },
    'GOV': { section: '§740.11', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.11' },
    'TMP': { section: '§740.9', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.9' },
    'GBS': { section: '§740.4', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.4' },
    'TSR': { section: '§740.6', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.6' },
    'RPL': { section: '§740.10', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.10' },
    'APP': { section: '§740.7', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.7' },
    'CIV': { section: '§740.5', url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.5' },
};

// Single Exception Card (Accordion Item)
const ExceptionCard = ({ result, isExpanded, onToggle }) => {
    const IconComponent = EXCEPTION_ICONS[result.code] || Info;
    const colors = EXCEPTION_COLORS[result.type] || EXCEPTION_COLORS['EXCEPTION'];
    const regLink = REG_LINKS[result.code];

    return (
        <div style={{
            marginBottom: '8px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
            backgroundColor: colors.bg,
            transition: 'all 0.2s ease'
        }}>
            {/* Header - Always visible */}
            <div
                onClick={onToggle}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? colors.bg : 'white',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        borderRadius: '8px',
                        backgroundColor: colors.border,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <IconComponent size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1e293b' }}>
                                {result.code}
                            </span>
                            {regLink && (
                                <a
                                    href={regLink.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        fontSize: '0.7rem',
                                        color: colors.border,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                    }}
                                >
                                    {regLink.section} <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{result.title}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: colors.border,
                        color: 'white',
                        fontWeight: '600'
                    }}>
                        {result.type === 'EXCEPTION' ? 'Eligible' : result.type === 'LICENSE_REQUIRED' ? 'Required' : 'Review'}
                    </span>
                    {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div style={{
                    padding: '16px',
                    borderTop: `1px solid ${colors.border}`,
                    backgroundColor: 'white'
                }}>
                    <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '12px', lineHeight: '1.5' }}>
                        {result.justification}
                    </p>

                    {result.caveats && result.caveats.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                                Requirements
                            </span>
                            <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px' }}>
                                {result.caveats.map((caveat, i) => (
                                    <li key={i} style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                                        {caveat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: colors.bg,
                        borderRadius: '6px'
                    }}>
                        <Info size={14} color={colors.border} />
                        <span style={{ fontSize: '0.85rem', color: colors.text, fontWeight: '500' }}>
                            Next: {result.nextSteps}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Exception Summary Component
const ExceptionSummary = ({ results }) => {
    const [expandedCards, setExpandedCards] = useState({});
    const [filter, setFilter] = useState('all');
    const [showFullMap, setShowFullMap] = useState(false);

    if (!results || results.length === 0) return null;

    const exceptionCount = results.filter(r => r.type === 'EXCEPTION').length;
    const licenseCount = results.filter(r => r.type === 'LICENSE_REQUIRED').length;
    const tipCount = results.filter(r => r.type === 'TIP').length;

    const toggleCard = (index) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        results.forEach((_, i) => { allExpanded[i] = true; });
        setExpandedCards(allExpanded);
    };

    const collapseAll = () => setExpandedCards({});

    const filteredResults = filter === 'all'
        ? results
        : results.filter(r => r.type === filter);

    return (
        <div style={{ marginBottom: '16px' }}>
            {/* Sticky Summary Panel */}
            <div style={{
                position: 'sticky',
                top: '70px',
                zIndex: 10,
                backgroundColor: 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>
                            {results.length} Result{results.length !== 1 ? 's' : ''} Found
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {exceptionCount > 0 && (
                                <span style={{
                                    fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                                    backgroundColor: '#ecfdf5', color: '#065f46', fontWeight: '600'
                                }}>
                                    {exceptionCount} Exception{exceptionCount !== 1 ? 's' : ''}
                                </span>
                            )}
                            {licenseCount > 0 && (
                                <span style={{
                                    fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                                    backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: '600'
                                }}>
                                    {licenseCount} License Required
                                </span>
                            )}
                            {tipCount > 0 && (
                                <span style={{
                                    fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                                    backgroundColor: '#fffbeb', color: '#92400e', fontWeight: '600'
                                }}>
                                    {tipCount} Tip{tipCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={expandAll}
                            style={{
                                fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px',
                                border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer'
                            }}
                        >
                            Expand All
                        </button>
                        <button
                            onClick={collapseAll}
                            style={{
                                fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px',
                                border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer'
                            }}
                        >
                            Collapse All
                        </button>
                        <button
                            onClick={() => setShowFullMap(true)}
                            style={{
                                fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px',
                                border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <Map size={12} /> View Full Map
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                {results.length > 3 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        {['all', 'EXCEPTION', 'LICENSE_REQUIRED', 'TIP'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px',
                                    border: '1px solid #e2e8f0', cursor: 'pointer',
                                    backgroundColor: filter === f ? '#2563eb' : 'white',
                                    color: filter === f ? 'white' : '#64748b',
                                    fontWeight: filter === f ? '600' : '400'
                                }}
                            >
                                {f === 'all' ? 'All' : f === 'EXCEPTION' ? 'Exceptions' : f === 'LICENSE_REQUIRED' ? 'License Req.' : 'Tips'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Exception Cards (Accordion) */}
            <div style={{ paddingRight: '4px' }}>
                {filteredResults.map((result, index) => (
                    <ExceptionCard
                        key={index}
                        result={result}
                        isExpanded={expandedCards[index] || false}
                        onToggle={() => toggleCard(index)}
                    />
                ))}
            </div>

            {/* Full Map Modal */}
            {showFullMap && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowFullMap(false)}>
                    <div style={{
                        backgroundColor: 'white', padding: '24px', borderRadius: '16px',
                        width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Full Exception Map</h3>
                            <button onClick={() => setShowFullMap(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Quick reference for exception codes found in these results.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
                            {results.filter(r => r.type === 'EXCEPTION').map((r, i) => (
                                <div key={i} style={{
                                    padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                    textAlign: 'center', backgroundColor: '#f8fafc'
                                }}>
                                    <span style={{ display: 'block', fontWeight: 'bold', color: '#1e293b' }}>{r.code}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{r.title}</span>
                                </div>
                            ))}
                            {results.filter(r => r.type === 'EXCEPTION').length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>No eligible exceptions found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExceptionSummary;
