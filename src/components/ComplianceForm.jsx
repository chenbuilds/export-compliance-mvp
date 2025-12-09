import React, { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import { Search, MessageCircle, History, FileText } from 'lucide-react';
import ExceptionSummary from './ExceptionSummary';
import DecisionVisualization from './DecisionVisualization';
import AIAssistant from './AIAssistant';
import ChatInterface, { ChatToggle } from './ChatInterface';
import { AuditLog, ReportDownload } from './AuditExport';
import UFLPAResultCard from './UFLPAResultCard';
import DPSResultCard from './DPSResultCard';
import { API_URL } from '../config/api';
// Import Agent Client
import { runShipmentEvaluation, mapAgentToLegacy } from '../api/agentClient';

const ComplianceForm = () => {
    const [runLaborScreening, setRunLaborScreening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        eccn: '',
        destination: '',
        value: '',
        endUserType: 'Commercial',
        endUserName: '',
        supplier: '',
        description: ''
    });
    const [results, setResults] = useState(null);
    const [dpsResult, setDpsResult] = useState(null);
    const [uflpaResult, setUflpaResult] = useState(null);
    const [trace, setTrace] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [showChat, setShowChat] = useState(false);
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [showReportDownload, setShowReportDownload] = useState(false);
    const [countries, setCountries] = useState([]);

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch(`${API_URL}/countries`);
                if (response.ok) {
                    const data = await response.json();
                    setCountries(data.countries.map(c => ({ value: c, label: c })));
                }
            } catch (err) {
                console.error("Failed to fetch countries:", err);
                // Fallback to basic list if API fails
                setCountries([
                    { value: 'China', label: 'China' },
                    { value: 'Russia', label: 'Russia' },
                    { value: 'United Kingdom', label: 'United Kingdom' },
                    { value: 'Canada', label: 'Canada' }
                ]);
            }
        };
        fetchCountries();
    }, []);

    // Handle form field changes
    const handleChange = (e) => {
        const { id, name, value, type, checked } = e.target;
        const fieldName = id || name;

        setFormData(prev => ({
            ...prev,
            [fieldName]: type === 'checkbox' ? checked : value
        }));

        if (formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: null }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setResults(null);
        setDpsResult(null);
        setUflpaResult(null);
        setTrace(null);
        setAiSuggestion(null);
        setMessage(null);
        setError(null);

        const errors = {};
        if (!formData.eccn) errors.eccn = "ECCN is required";
        if (!formData.value) errors.value = "Value is required";
        if (!formData.destination) errors.destination = "Destination is required";

        if (runLaborScreening) {
            if (!formData.supplier) errors.supplier = "Supplier is required for screening";
            if (!formData.description) errors.description = "Commodity description required";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            // Updated to use the new Agent Orchestrator
            const agentResponse = await runShipmentEvaluation({
                ...formData,
                runLaborScreening
            });

            // Map the unifiedAgentResponse to the legacy state format expected by UI components
            const legacyData = mapAgentToLegacy(agentResponse);

            if (legacyData.license_results) {
                setResults(legacyData.license_results.results);
                setTrace(legacyData.license_results.trace);
            }

            // Only set UFLPA if it was requested/returned (Agent might run it automatically if high risk, but we respect UI toggle)
            if (legacyData.uflpa_results) {
                setUflpaResult(legacyData.uflpa_results);
            }

            if (legacyData.dps_results) {
                setDpsResult(legacyData.dps_results);
            }

            if (legacyData.ai_insight) {
                setAiSuggestion(legacyData.ai_insight);
            }

        } catch (error) {
            console.error("Compliance Check Error:", error);
            setError(`Agent Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div style={{
                display: 'grid',
                gridTemplateColumns: results ? '1fr 1fr' : '1fr',
                gap: '24px',
                alignItems: 'start'
            }}>
                {/* Left Column: Form */}
                <Card title="Export Details">
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Shipment / License */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                Shipment & License
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <Input
                                    id="eccn"
                                    label="ECCN / USML"
                                    placeholder="e.g. 1A995"
                                    value={formData.eccn}
                                    onChange={handleChange}
                                    required
                                    error={formErrors.eccn}
                                />
                                <Input
                                    id="destination"
                                    label="Destination"
                                    type="select"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    error={formErrors.destination}
                                    options={countries}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <Input
                                    id="value"
                                    label="Value (USD)"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.value}
                                    onChange={handleChange}
                                    error={formErrors.value}
                                />
                                <Input
                                    id="endUserType"
                                    label="End User Type"
                                    type="select"
                                    value={formData.endUserType}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'Commercial', label: 'Commercial' },
                                        { value: 'Government', label: 'Government' },
                                        { value: 'Individual', label: 'Individual' },
                                        { value: 'Military', label: 'Military' }
                                    ]}
                                />
                            </div>

                            <Input
                                id="endUserName"
                                label="End User Name"
                                placeholder="For Denied Party Screening (Optional)"
                                value={formData.endUserName}
                                onChange={handleChange}
                                style={{ marginTop: '1rem' }}
                            />
                        </div>

                        {/* Section 2: Forced Labour */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                <h4 style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                    Forced Labour Screening
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="runLaborScreening"
                                        checked={runLaborScreening}
                                        onChange={(e) => setRunLaborScreening(e.target.checked)}
                                        style={{ accentColor: '#2563eb', width: '16px', height: '16px' }}
                                    />
                                    <label htmlFor="runLaborScreening" style={{ fontSize: '0.9rem', color: '#475569', cursor: 'pointer', margin: 0 }}>Enable UFLPA Check</label>
                                </div>
                            </div>

                            {runLaborScreening ? (
                                <>
                                    <Input
                                        id="supplier"
                                        label="Supplier Name"
                                        placeholder="e.g. Xinjiang Cotton Co"
                                        value={formData.supplier}
                                        onChange={handleChange}
                                        required={runLaborScreening}
                                        error={formErrors.supplier}
                                    />
                                    <Input
                                        id="description"
                                        label="Commodity / Description"
                                        placeholder="Briefly describe item (e.g. Cotton Shirt)"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required={runLaborScreening}
                                        error={formErrors.description}
                                        type="textarea"
                                    />
                                </>
                            ) : (
                                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                                    Enable screening to check against UFLPA Entity List and high-risk commodities.
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-center">
                            <Button type="submit" variant="primary" disabled={isLoading} style={{ width: '100%' }}>
                                <Search size={18} /> {isLoading ? 'Running Compliance Engine...' : 'Evaluate Shipment'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Right Column: Results */}
                {(results || error) && (
                    <div id="results" style={{ marginBottom: '2rem' }}>

                        {/* Summary Strip */}
                        {results && (
                            <div style={{
                                backgroundColor: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                {/* License Summary Line */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '600', color: '#334155' }}>License Status:</span>
                                    {results.some(r => r.type === 'EXCEPTION') ? (
                                        <span style={{ color: '#059669', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
                                            Exceptions Found ({results.filter(r => r.type === 'EXCEPTION').map(r => r.code).join(', ')})
                                        </span>
                                    ) : results.some(r => r.type === 'LICENSE_REQUIRED') ? (
                                        <span style={{ color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
                                            LICENSE REQUIRED
                                        </span>
                                    ) : (
                                        <span style={{ color: '#059669', fontWeight: 'bold' }}>NLR (No License Required)</span>
                                    )}
                                </div>

                                {/* UFLPA Summary Line */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                                    <span style={{ fontWeight: '600', color: '#334155' }}>Forced Labour Risk:</span>
                                    {runLaborScreening && uflpaResult ? (
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: uflpaResult.risk_level === 'CLEAR' ? '#059669' : (uflpaResult.risk_level === 'WARNING' ? '#d97706' : '#dc2626'),
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: uflpaResult.risk_level === 'CLEAR' ? '#059669' : (uflpaResult.risk_level === 'WARNING' ? '#d97706' : '#dc2626') }}></div>
                                            {uflpaResult.risk_level.replace('_', ' ')}
                                        </span>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Screened</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* License Results */}
                        {results && <ExceptionSummary results={results} />}

                        {/* UFLPA Card */}
                        {runLaborScreening && uflpaResult && <UFLPAResultCard result={uflpaResult} />}
                        {!runLaborScreening && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                Forced Labour Screening was skipped for this shipment.
                            </div>
                        )}

                        {/* DPS Card (if exists) */}
                        {dpsResult && <DPSResultCard result={dpsResult} />}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Button variant="primary" onClick={() => setShowReportDownload(true)}>
                                <FileText size={16} /> Download V2 Report
                            </Button>
                            <Button variant="secondary" onClick={() => setShowAuditLog(true)}>
                                <History size={16} /> Audit Log
                            </Button>
                        </div>

                        {/* Visualization */}
                        {trace && <DecisionVisualization trace={trace} collapsible={true} />}

                        {/* AI Insight */}
                        {aiSuggestion && <AIAssistant suggestion={aiSuggestion} />}

                        {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
                    </div>
                )}
            </div>

            {/* Modals */}
            {!showChat && <ChatToggle onClick={() => setShowChat(true)} />}
            {showChat && <ChatInterface formContext={formData} onClose={() => setShowChat(false)} />}
            {showAuditLog && <AuditLog onClose={() => setShowAuditLog(false)} />}
            {showReportDownload && <ReportDownload formData={formData} onClose={() => setShowReportDownload(false)} />}
        </>
    );
};

export default ComplianceForm;
