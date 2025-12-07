import React, { useState, useEffect } from 'react';
import { FileText, Download, History, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { API_URL } from '../config/api';

/**
 * AuditLog - Displays the audit trail of all compliance checks
 */
const AuditLog = ({ onClose }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAuditLog();
    }, []);

    const fetchAuditLog = async () => {
        try {
            const response = await fetch(`${API_URL}/audit?limit=20`);
            const data = await response.json();
            setLogs(data.audit_log || []);
        } catch (error) {
            console.error('Failed to fetch audit log:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'evaluation': return <CheckCircle size={16} color="#22c55e" />;
            case 'chat': return <History size={16} color="#3b82f6" />;
            default: return <Clock size={16} color="#64748b" />;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
        }}>
            <div style={{
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80vh',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={20} />
                        <h3 style={{ margin: 0 }}>Audit Log</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {isLoading ? (
                        <p>Loading audit log...</p>
                    ) : logs.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No audit entries yet.</p>
                    ) : (
                        logs.reverse().map((log, idx) => (
                            <div key={idx} style={{
                                padding: '0.75rem',
                                borderBottom: '1px solid var(--border-color)',
                                fontSize: '0.9rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    {getEventIcon(log.event_type)}
                                    <strong style={{ textTransform: 'capitalize' }}>{log.event_type}</strong>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                {log.input_data?.eccn && (
                                    <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                                        ECCN: {log.input_data.eccn} → {log.input_data?.destination || 'N/A'}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * ReportDownload - Component to generate and download compliance reports
 */
const ReportDownload = ({ formData, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const generateReport = async (format) => {
        setIsGenerating(true);
        try {
            const response = await fetch(`${API_URL}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, format })
            });

            if (format === 'pdf') {
                const blob = await response.blob();
                downloadBlob(blob, `compliance-report-${Date.now()}.pdf`);
            } else if (format === 'text') {
                const text = await response.text();
                downloadFile(text, `compliance-report-${Date.now()}.txt`, 'text/plain');
            } else {
                const data = await response.json();
                downloadFile(JSON.stringify(data, null, 2), `compliance-report-${Date.now()}.json`, 'application/json');
            }
        } catch (error) {
            console.error('Report generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadFile = (content, filename, type) => {
        const blob = new Blob([content], { type });
        downloadBlob(blob, filename);
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const sendEmail = () => {
        if (email) {
            // Simulate email (no backend SMTP yet)
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 3000);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
        }}>
            <Card style={{ width: '90%', maxWidth: '420px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} />
                        <h3 style={{ margin: 0 }}>Export Report</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Download your compliance evaluation report.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <Button
                        variant="primary"
                        onClick={() => generateReport('pdf')}
                        disabled={isGenerating}
                        style={{ flex: 1, minWidth: '100px' }}
                    >
                        <Download size={16} /> PDF
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => generateReport('json')}
                        disabled={isGenerating}
                        style={{ flex: 1, minWidth: '100px' }}
                    >
                        <Download size={16} /> JSON
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => generateReport('text')}
                        disabled={isGenerating}
                        style={{ flex: 1, minWidth: '100px' }}
                    >
                        <Download size={16} /> Text
                    </Button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Email report (coming soon):
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                flex: 1, padding: '10px 12px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', fontSize: '0.9rem'
                            }}
                        />
                        <Button variant="secondary" onClick={sendEmail} disabled={!email}>
                            Send
                        </Button>
                    </div>
                    {emailSent && (
                        <p style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '8px' }}>
                            ✓ Email functionality requires SMTP setup
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export { AuditLog, ReportDownload };

