import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        gap: '0.5rem',
        fontSize: '1rem',
        opacity: disabled ? 0.7 : 1
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--accent-primary)',
            color: '#fff'
        },
        secondary: {
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
        },
        outline: {
            backgroundColor: 'transparent',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)'
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn ${className}`}
            style={{ ...baseStyle, ...variants[variant] }}
        >
            {children}
        </button>
    );
};

export default Button;
