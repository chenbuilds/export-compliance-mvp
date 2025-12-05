import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, Shield, Lock, FileText, Clock, Globe, ExternalLink } from 'lucide-react';

const ResultsCard = ({ result }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getExceptionIcon = (code) => {
        switch (code) {
            case 'LVS': return <FileText color="#10b981" size={20} />;
            case 'STA': return <Globe color="#3b82f6" size={20} />;
            case 'ENC': return <Lock color="#8b5cf6" size={20} />;
            case 'GOV': return <Shield color="#0891b2" size={20} />;
            case 'TMP': return <Clock color="#f59e0b" size={20} />;
            case 'GBS': return <Globe color="#10b981" size={20} />;
            case 'EMBARGO': return <AlertCircle color="#ef4444" size={20} />;
            case 'IVL': return <FileText color="#ef4444" size={20} />;
            case 'TIP': return <Info color="#f59e0b" size={20} />;
            default: return <CheckCircle color="#10b981" size={20} />;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'EXCEPTION': return <CheckCircle color="#10b981" size={24} />;
            case 'LICENSE_REQUIRED': return <AlertCircle color="#ef4444" size={24} />;
            case 'NLR': return <CheckCircle color="#3b82f6" size={24} />;
            case 'TIP': return <Info color="#f59e0b" size={24} />;
            default: return <Info color="#64748b" size={24} />;
        }
    };

    const getBorderColor = (type, code) => {
        if (code === 'TIP') return '#f59e0b';
        switch (type) {
            case 'EXCEPTION': return '#10b981';
            case 'LICENSE_REQUIRED': return '#ef4444';
            case 'NLR': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const getBgGradient = (type, code) => {
        if (code === 'TIP') return 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
        switch (type) {
            case 'EXCEPTION': return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
            case 'LICENSE_REQUIRED': return 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
            default: return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
        }
    };

    const getActionButton = (code) => {
        switch (code) {
            case 'LVS': return { text: 'Document LVS Usage', action: 'document', available: true };
            case 'STA': return { text: 'Get Consignee Statement', action: 'sta', available: true };
            case 'ENC': return { text: 'Self-Classification', action: 'enc', available: true };
            case 'GOV': return { text: 'Verify Agency', action: 'gov', available: true };
            case 'IVL': return { text: 'Apply in SNAP-R', action: 'snapr', available: true };
            case 'TIP': return { text: 'Review Value', action: 'review', available: true };
            default: return null;
        }
    };

    const getRegLink = (code) => {
        const links = {
            'LVS': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.3', label: '§740.3', name: 'Limited Value' },
            'STA': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.20', label: '§740.20', name: 'Strategic Trade' },
            'TMP': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.9', label: '§740.9', name: 'Temporary' },
            'GOV': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.11', label: '§740.11', name: 'Government' },
            'GBS': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.4', label: '§740.4', name: 'Group B' },
            'ENC': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.17', label: '§740.17', name: 'Encryption' },
            'TSR': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.6', label: '§740.6', name: 'Tech/Software' },
            'RPL': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.10', label: '§740.10', name: 'Replacement' },
            'APP': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.7', label: '§740.7', name: 'Computers' },
            'NAC': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.2', label: '§740.2(a)', name: 'National Security' },
            'CIV': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.5', label: '§740.5', name: 'Civil End-Users' },
            'BAG': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.14', label: '§740.14', name: 'Baggage' },
            'AVS': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-740/section-740.15', label: '§740.15', name: 'Aircraft/Vessels' },
            'NLR': { url: 'https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-734', label: 'EAR99', name: 'No License Required' },
        };
        return links[code] || null;
    };

    const actionBtn = getActionButton(result.code);

    return (
        <div className="card animate-fade-in" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            borderLeft: `5px solid ${getBorderColor(result.type, result.code)}`,
            borderTop: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '16px',
            background: getBgGradient(result.type, result.code)
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {getExceptionIcon(result.code)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                            {result.title}
                        </h3>
                        <span style={{
                            fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px',
                            background: 'white', color: getBorderColor(result.type, result.code),
                            fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            {result.code}
                        </span>
                        {getRegLink(result.code) && (
                            <a
                                href={getRegLink(result.code).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`View ${getRegLink(result.code).label} in eCFR`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    fontSize: '0.7rem', color: '#2563eb', textDecoration: 'none',
                                    padding: '2px 6px', borderRadius: '4px', background: '#eff6ff'
                                }}
                            >
                                <Info size={12} /> {getRegLink(result.code).label}
                            </a>
                        )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                        {result.justification}
                    </p>
                </div>
            </div>

            {result.nextSteps && (
                <div style={{
                    backgroundColor: 'white', padding: '12px 16px', borderRadius: '10px',
                    marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <ExternalLink size={16} color="#2563eb" />
                    <span style={{ fontSize: '0.9rem' }}><strong>Next:</strong> {result.nextSteps}</span>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {actionBtn && (
                    <div style={{ position: 'relative' }}>
                        <Button
                            variant="primary"
                            style={{ fontSize: '0.85rem', padding: '8px 14px', borderRadius: '8px', opacity: 0.7 }}
                            title="Feature coming soon – Integration not yet available"
                        >
                            {actionBtn.text}
                        </Button>
                        <span style={{
                            position: 'absolute', top: '-8px', right: '-8px',
                            fontSize: '0.6rem', background: '#f59e0b', color: 'white',
                            padding: '2px 6px', borderRadius: '10px', fontWeight: '600'
                        }}>Soon</span>
                    </div>
                )}
                <Button variant="secondary" onClick={() => setIsExpanded(!isExpanded)} style={{ fontSize: '0.85rem', padding: '8px 14px', borderRadius: '8px' }}>
                    {isExpanded ? (
                        <>Hide Details <ChevronUp size={14} /></>
                    ) : (
                        <>View Details <ChevronDown size={14} /></>
                    )}
                </Button>
            </div>

            {isExpanded && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Regulatory Caveats
                    </h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {result.caveats && result.caveats.map((caveat, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{caveat}</li>
                        ))}
                    </ul>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        * This is a simplified assessment. Always consult official EAR/ITAR regulations.
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsCard;
