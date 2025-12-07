import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const UFLPAResultCard = ({ result }) => {
    if (!result || !result.risk_level) return null;

    const getRiskConfig = (level) => {
        switch (level) {
            case 'HIGH':
                return {
                    color: '#ef4444', // Red 500
                    bg: '#fef2f2', // Red 50
                    border: '#fca5a5', // Red 300
                    icon: AlertOctagon,
                    label: 'High Risk (UFLPA Alert)',
                    description: 'Strong indicators of forced labor risk. Rebuttable presumption may apply.'
                };
            case 'MEDIUM':
                return {
                    color: '#f59e0b', // Amber 500
                    bg: '#fffbeb', // Amber 50
                    border: '#fcd34d', // Amber 300
                    icon: AlertTriangle,
                    label: 'Medium Risk',
                    description: 'Potential risk factors identified in supply chain or commodity.'
                };
            case 'LOW':
            default:
                return {
                    color: '#10b981', // Emerald 500
                    bg: '#ecfdf5', // Emerald 50
                    border: '#6ee7b7', // Emerald 300
                    icon: CheckCircle,
                    label: 'Low Risk',
                    description: 'No immediate forced labor indicators detected.'
                };
        }
    };

    const config = getRiskConfig(result.risk_level);
    const Icon = config.icon;

    if (result.risk_level === 'LOW') return null; // Optionally hide if low risk to reduce clutter

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
                        Forced Labor Screen: <span style={{ color: config.color }}>{config.label}</span>
                    </h3>
                </div>

                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569' }}>
                    {config.description}
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.6)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    border: `1px solid ${config.border}`
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {result.match_name && (
                            <div style={{ color: '#dc2626', fontWeight: 600 }}>
                                ⚠ Entity Match: {result.match_name} ({result.category})
                            </div>
                        )}

                        {result.reason && (
                            <div><span style={{ fontWeight: 600 }}>Reason:</span> {result.reason}</div>
                        )}

                        {result.details && result.details.length > 0 && (
                            <ul style={{ margin: '4px 0 4px 20px', padding: 0, color: '#4b5563' }}>
                                {result.details.map((detail, idx) => (
                                    <li key={idx}>{detail}</li>
                                ))}
                            </ul>
                        )}

                        {result.action && (
                            <div style={{ marginTop: '4px', fontWeight: '500', color: '#1f2937' }}>
                                <span style={{ textDecoration: 'underline' }}>Required Action:</span> {result.action}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Info size={12} /> Checked against UFLPA Entity List and high-risk commodity sectors.
                </div>
            </div>
        </div>
    );
};

export default UFLPAResultCard;
