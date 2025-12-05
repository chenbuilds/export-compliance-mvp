import React, { useState } from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';

const Input = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    options = [],
    tooltip,
    error
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const containerStyle = {
        marginBottom: 'var(--spacing-md)',
        position: 'relative'
    };

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--text-secondary)'
    };

    const inputBaseStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: error ? '1px solid var(--error-color)' : '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    const renderInput = () => {
        if (type === 'select') {
            return (
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    style={inputBaseStyle}
                    required={required}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{ ...inputBaseStyle, minHeight: '100px' }}
                    required={required}
                />
            );
        }

        return (
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={inputBaseStyle}
                required={required}
            />
        );
    };

    return (
        <div style={containerStyle}>
            <label htmlFor={id} style={labelStyle}>
                {label}
                {required && <span style={{ color: 'var(--error-color)' }}>*</span>}
                {tooltip && (
                    <div
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'help' }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <HelpCircle size={16} strokeWidth={1.5} />
                        {showTooltip && (
                            <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: '#1e293b',
                                color: '#fff',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                width: '200px',
                                zIndex: 50,
                                textAlign: 'center',
                                marginBottom: '5px'
                            }}>
                                {tooltip}
                                <div style={{
                                    content: '""',
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    marginLeft: '-5px',
                                    borderWidth: '5px',
                                    borderStyle: 'solid',
                                    borderColor: '#1e293b transparent transparent transparent'
                                }}></div>
                            </div>
                        )}
                    </div>
                )}
            </label>

            {renderInput()}

            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default Input;
