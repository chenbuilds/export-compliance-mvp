import React, { useState } from 'react';

const InputForm = ({ onCheck, isLoading }) => {
    const [formData, setFormData] = useState({
        eccn: '',
        description: '',
        destination: '',
        endUserType: '',
        isGovernmentContract: false,
        endUseDescription: '',
        value: '',
        quantity: 1,
        currency: 'USD',
        isReExport: false
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.eccn.trim()) newErrors.eccn = "ECCN / USML Category is required.";
        if (!formData.destination) newErrors.destination = "Destination is required.";
        if (!formData.endUserType) newErrors.endUserType = "End User Type is required.";
        if (!formData.value || formData.value <= 0) newErrors.value = "Declared Value must be positive.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onCheck(formData);
        }
    };

    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '0.875rem',
        borderRadius: 'var(--radius-md)',
        border: hasError ? '1px solid var(--error-color)' : '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        marginBottom: hasError ? '0.25rem' : 'var(--spacing-md)',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontSize: '1rem'
    });

    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xs)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: '500'
    };

    const errorStyle = {
        color: 'var(--error-color)',
        fontSize: '0.85rem',
        marginBottom: 'var(--spacing-md)'
    };

    return (
        <div className="card">
            <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.5rem', fontWeight: 'bold' }}>Export Details</h2>
            <form onSubmit={handleSubmit}>

                {/* Product Information */}
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Product Information</h3>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={labelStyle}>
                            ECCN / USML Category
                            <span className="tooltip-container">
                                ?
                                <span className="tooltip-text">Export Control Classification Number (e.g. 1A995) or USML Category (e.g. VIII).</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="eccn"
                            value={formData.eccn}
                            onChange={handleChange}
                            placeholder="e.g. 1A995"
                            style={inputStyle(errors.eccn)}
                        />
                        {errors.eccn && <div style={errorStyle}>{errors.eccn}</div>}
                    </div>

                    <label style={labelStyle}>Product Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the item technical specifications..."
                        style={{ ...inputStyle(false), minHeight: '100px' }}
                    />
                </div>

                {/* Destination Information */}
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Destination & End User</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={labelStyle}>Destination Country</label>
                            <select name="destination" value={formData.destination} onChange={handleChange} style={inputStyle(errors.destination)}>
                                <option value="">Select Country</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Germany">Germany</option>
                                <option value="China">China</option>
                                <option value="Colombia">Colombia</option>
                                <option value="Iran">Iran</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Japan">Japan</option>
                            </select>
                            {errors.destination && <div style={errorStyle}>{errors.destination}</div>}
                        </div>

                        <div>
                            <label style={labelStyle}>End User Type</label>
                            <select name="endUserType" value={formData.endUserType} onChange={handleChange} style={inputStyle(errors.endUserType)}>
                                <option value="">Select Type</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Government">Government</option>
                                <option value="Military">Military</option>
                                <option value="NGO">NGO</option>
                                <option value="Individual">Individual</option>
                            </select>
                            {errors.endUserType && <div style={errorStyle}>{errors.endUserType}</div>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                        <label style={{ ...labelStyle, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isGovernmentContract"
                                checked={formData.isGovernmentContract}
                                onChange={handleChange}
                                style={{ marginRight: '0.5rem' }}
                            />
                            Government Contract?
                        </label>

                        <label style={{ ...labelStyle, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isReExport"
                                checked={formData.isReExport}
                                onChange={handleChange}
                                style={{ marginRight: '0.5rem' }}
                            />
                            Re-export?
                        </label>
                    </div>
                </div>

                {/* Shipment Info */}
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Shipment Details</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={labelStyle}>Declared Value</label>
                            <input
                                type="number"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                placeholder="0.00"
                                style={inputStyle(errors.value)}
                            />
                            {errors.value && <div style={errorStyle}>{errors.value}</div>}
                        </div>

                        <div>
                            <label style={labelStyle}>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                style={inputStyle(false)}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Currency</label>
                            <select name="currency" value={formData.currency} onChange={handleChange} style={inputStyle(false)}>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Evaluate Compliance'}
                </button>
            </form>
        </div>
    );
};

export default InputForm;
