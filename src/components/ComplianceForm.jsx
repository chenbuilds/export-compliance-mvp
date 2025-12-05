import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import { Search, MessageCircle, History, FileText } from 'lucide-react';
import ExceptionSummary from './ExceptionSummary';
import DecisionVisualization from './DecisionVisualization';
import AIAssistant from './AIAssistant';
import ChatInterface, { ChatToggle } from './ChatInterface';
import { AuditLog, ReportDownload } from './AuditExport';

const ComplianceForm = () => {
    const [formData, setFormData] = useState({
        eccn: '',
        description: '',
        destination: 'Germany',
        endUserType: 'Commercial',
        value: '',
        quantity: 1,
        currency: 'USD',
        reExport: false,
        isGovernmentContract: false
    });

    const [results, setResults] = useState(null);
    const [trace, setTrace] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Modal states
    const [showChat, setShowChat] = useState(false);
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [showReportDownload, setShowReportDownload] = useState(false);


    // Handle form field changes
    const handleChange = (e) => {
        const { id, name, value, type, checked } = e.target;
        // Handle potentially different event targets (Input component passes id/name correctly)
        const fieldName = id || name;

        setFormData(prev => ({
            ...prev,
            [fieldName]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: null }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setResults(null);
        setTrace(null);
        setAiSuggestion(null);
        setMessage(null);
        setError(null);

        // Simple form validation
        const errors = {};
        if (!formData.eccn) errors.eccn = "ECCN is required";
        if (!formData.value) errors.value = "Value is required";
        if (!formData.destination) errors.destination = "Destination is required";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            // Send form data to Flask backend via POST request
            // Ensure port matches backend (5001)
            const response = await fetch('http://localhost:5001/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Handle response based on backend structure
            // My backend returns { results: [], ai_suggestion: ... }
            // The user's prompt suggested { message: ... }
            // I will handle both cases for robustness.

            if (data.results) setResults(data.results);
            if (data.trace) setTrace(data.trace);
            if (data.ai_suggestion) setAiSuggestion(data.ai_suggestion);
            if (data.message) setMessage(data.message);
            if (data.error) setError(data.error);

        } catch (error) {
            setError("Something went wrong. Please ensure the backend is running on port 5001.");
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            {/* ECCN / USML Category */}
                            <Input
                                id="eccn"
                                label="ECCN / USML Category"
                                placeholder="e.g. 1A995"
                                value={formData.eccn}
                                onChange={handleChange}
                                required
                                tooltip="Export Control Classification Number or USML Category."
                                error={formErrors.eccn}
                            />

                            {/* Destination */}
                            <Input
                                id="destination"
                                label="Destination Country"
                                type="select"
                                value={formData.destination}
                                onChange={handleChange}
                                error={formErrors.destination}
                                options={[
                                    { value: 'Germany', label: 'Germany' },
                                    { value: 'United Kingdom', label: 'United Kingdom' },
                                    { value: 'China', label: 'China' },
                                    { value: 'Iran', label: 'Iran' },
                                    { value: 'North Korea', label: 'North Korea' },
                                    { value: 'Colombia', label: 'Colombia' },
                                    { value: 'Canada', label: 'Canada' },
                                    { value: 'Australia', label: 'Australia' },
                                    { value: 'France', label: 'France' },
                                    { value: 'Japan', label: 'Japan' },
                                ]}
                            />

                            {/* Value and Currency */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <Input
                                    id="value"
                                    label="Declared Value"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.value}
                                    onChange={handleChange}
                                    tooltip="Total monetary value of the goods affecting license exceptions."
                                    error={formErrors.value}
                                />
                                <Input
                                    id="currency"
                                    label="Currency"
                                    type="select"
                                    value={formData.currency || 'USD'}
                                    onChange={handleChange}
                                    options={[
                                        { value: 'USD', label: 'USD' },
                                        { value: 'EUR', label: 'EUR' },
                                        { value: 'GBP', label: 'GBP' },
                                    ]}
                                />
                            </div>

                            {/* Quantity */}
                            <Input
                                id="quantity"
                                label="Quantity"
                                type="number"
                                placeholder="1"
                                value={formData.quantity}
                                onChange={handleChange}
                            />

                            {/* End User Type */}
                            <Input
                                id="endUserType"
                                label="End User Type"
                                type="select"
                                value={formData.endUserType}
                                onChange={handleChange}
                                options={[
                                    { value: 'Commercial', label: 'Commercial' },
                                    { value: 'Government', label: 'Government' },
                                    { value: 'Military', label: 'Military' },
                                    { value: 'NGO', label: 'NGO' },
                                    { value: 'Individual', label: 'Individual' },
                                ]}
                            />
                        </div>

                        {/* Re-export Toggle */}
                        <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                type="checkbox"
                                id="reExport"
                                checked={formData.reExport || false}
                                onChange={handleChange}
                                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                            />
                            <label htmlFor="reExport" style={{ margin: 0, color: 'var(--text-primary)', cursor: 'pointer' }}>Re-export (Item will be shipped to another country)</label>
                        </div>

                        {/* Product Description */}
                        <Input
                            id="description"
                            label="Product Description"
                            type="textarea"
                            placeholder="Briefly describe the item and its end use..."
                            value={formData.description}
                            onChange={handleChange}
                        />

                        <div className="mt-4 text-center" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Button type="submit" variant="primary" disabled={isLoading}>
                                <Search size={18} /> {isLoading ? 'Evaluating...' : 'Evaluate Compliance'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Right Column: Results */}
                {(results || trace || message || error) && (
                    <div id="results" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Compliance Results</h3>

                        {error && (
                            <Card className="error-card" style={{ borderLeft: '4px solid var(--error-color)' }}>
                                <div style={{ color: 'var(--error-color)' }}><strong>Error:</strong> {error}</div>
                            </Card>
                        )}

                        {message && (
                            <Card>
                                <strong>{message}</strong>
                            </Card>
                        )}

                        {/* Compliance Results - PRIMARY (show first) */}
                        {results && <ExceptionSummary results={results} />}

                        {/* Action Buttons - immediately after results */}
                        {results && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <Button variant="primary" onClick={() => setShowReportDownload(true)}>
                                    <FileText size={16} /> Download Report
                                </Button>
                                <Button variant="secondary" onClick={() => setShowAuditLog(true)}>
                                    <History size={16} /> View Audit Log
                                </Button>
                            </div>
                        )}

                        {/* Decision Trace - SECONDARY (collapsible below results) */}
                        {trace && <DecisionVisualization trace={trace} collapsible={true} />}

                        {/* AI Assistant inline */}
                        {aiSuggestion && <AIAssistant suggestion={aiSuggestion} />}
                    </div>
                )}
            </div>

            {/* Chat Toggle Button */}
            {!showChat && <ChatToggle onClick={() => setShowChat(true)} />}

            {/* Chat Interface */}
            {showChat && (
                <ChatInterface
                    formContext={formData}
                    onClose={() => setShowChat(false)}
                />
            )}

            {/* Audit Log Modal */}
            {showAuditLog && <AuditLog onClose={() => setShowAuditLog(false)} />}

            {/* Report Download Modal */}
            {showReportDownload && (
                <ReportDownload
                    formData={formData}
                    onClose={() => setShowReportDownload(false)}
                />
            )}
        </>
    );
};

export default ComplianceForm;
