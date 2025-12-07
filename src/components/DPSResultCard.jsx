import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, ExternalLink } from 'lucide-react';

const DPSResultCard = ({ result }) => {
    if (!result || !result.status) return null;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'BLOCKED':
                return {
                    color: '#ef4444', // Red 500
                    bg: '#fef2f2', // Red 50
                    border: '#fca5a5', // Red 300
                    icon: ShieldAlert,
                    label: 'Restricted Party Found',
                    description: 'This entity is on a restricted party list. Export is likely prohibited.'
                };
            case 'POTENTIAL_MATCH':
                return {
                    color: '#f59e0b', // Amber 500
                    bg: '#fffbeb', // Amber 50
                    border: '#fcd34d', // Amber 300
                    icon: AlertTriangle,
                    label: 'Potential Match',
                    description: 'This entity matches a name on a watchlist. Further verification required.'
                };
            case 'CLEAR':
            default:
                return {
                    color: '#10b981', // Emerald 500
                    bg: '#ecfdf5', // Emerald 50
                    border: '#6ee7b7', // Emerald 300
                    icon: ShieldCheck,
                    label: 'No Matches Found',
                    description: 'No exact matches found in the denied party screening database.'
                };
        }
    };

    const config = getStatusConfig(result.status);
    const Icon = config.icon;

    return (
        <div style={{
            background: config.bg,
            border: `1px solid ${config.border}`,
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            display: 'flex',
            gap: '12px'
        }}>
            <div style={{
                background: config.color,
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <Icon size={18} color="white" />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                        Denied Party Screening: <span style={{ color: config.color }}>{config.label}</span>
                    </h3>
                </div>

                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569' }}>
                    {config.description}
                </p>

                {result.status !== 'CLEAR' && (
                    <div style={{
                        background: 'rgba(255,255,255,0.6)',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        border: `1px solid ${config.border}`
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
                            {result.match_name && (
                                <>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Matched Name:</span>
                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{result.match_name}</span>
                                </>
                            )}
                            {result.list && (
                                <>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>List Source:</span>
                                    <span style={{ color: '#1e293b' }}>{result.list}</span>
                                </>
                            )}
                            {result.reason && (
                                <>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Reason:</span>
                                    <span style={{ color: '#1e293b' }}>{result.reason}</span>
                                </>
                            )}
                            {result.reference && (
                                <>
                                    <span style={{ fontWeight: '600', color: '#64748b' }}>Reference:</span>
                                    <span style={{ color: '#1e293b', fontFamily: 'monospace' }}>{result.reference}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {result.status === 'CLEAR' && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info size={12} /> Checked against BIS Entity List, OFAC SDN, and other consolidated lists.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DPSResultCard;
