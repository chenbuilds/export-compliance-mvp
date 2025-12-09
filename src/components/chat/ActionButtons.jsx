
import React, { useState } from 'react';
import { Mail, FileText, Download, Copy, Loader, Check } from 'lucide-react';
import { API_URL } from '../../config/api';

const ActionButtons = ({ data, context }) => {
    // data: { actions: [{label, type}] } + context (implied, likely need context prop passed down if not in data)
    // Actually action usually just triggers based on current state.
    // NOTE: In a real app we need the Context/Shipment data. 
    // AgentOrchestrator generates actions but the component might need the data.
    // For now we assume the parent passes relevant context or we handle simplistic triggers.

    const { actions } = data;
    const [loading, setLoading] = useState(null);
    const [status, setStatus] = useState(null); // 'sent' | 'error'

    const handleAction = async (action) => {
        if (action.type === 'copy') return;

        setLoading(action.type);
        try {
            // Placeholder: In real app we need the full shipment blob.
            // We'll mock a request or rely on backend session if available.
            // Assuming `AgentConsole` maintains state, but here we just have props.
            // We will fetch against the endpoints we made.

            // For demo purposes, we'll try to hit the endpoint with a dummy payload 
            // if we don't have the full context here.
            // Ideally AgentMessage should have access to `formData` or it's embedded in `data`.

            // Use passed context for payload
            const payload = {
                email: action.recipient || "user@example.com",
                format: 'pdf',
                includePdf: true,
                ...context // Spread shipment data (eccn, destination, value, etc)
            };

            const endpoint = action.type === 'email' ? '/send-email' : '/report';
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus('sent');
                setTimeout(() => setStatus(null), 3000);
            } else {
                alert("Failed to perform action.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 pt-2">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={() => handleAction(action)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95"
                >
                    {action.type === 'email' && <Mail size={14} />}
                    {action.type === 'pdf' && <FileText size={14} />}
                    {action.type === 'download' && <Download size={14} />}
                    {action.label}
                </button>
            ))}
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors ml-auto" title="Copy Summary">
                <Copy size={14} />
            </button>
        </div>
    );
};

export default ActionButtons;
