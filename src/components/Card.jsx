import React from 'react';

const Card = ({ children, title, className = '' }) => {
    return (
        <div className={`card ${className}`} style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid var(--border-color)',
            marginBottom: 'var(--spacing-lg)'
        }}>
            {title && (
                <h2 style={{
                    marginBottom: 'var(--spacing-lg)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)'
                }}>
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
};

export default Card;
