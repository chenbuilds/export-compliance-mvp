import React from 'react';
import { Shield, BookOpen, HelpCircle } from 'lucide-react';

const Layout = ({ children }) => {
    return (
        <div className="layout-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Shield size={20} color="white" />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#1e293b', letterSpacing: '-0.02em' }}>
                            ExportShield
                        </span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                            color: '#166534',
                            borderRadius: '20px',
                            fontWeight: '600',
                            marginLeft: '4px'
                        }}>
                            AI Powered
                        </span>
                    </div>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                            href="https://www.bis.doc.gov/index.php/regulations/export-administration-regulations-ear"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '8px',
                                color: '#475569', fontSize: '0.9rem', fontWeight: '500',
                                textDecoration: 'none', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <BookOpen size={16} /> Docs
                        </a>
                        <a
                            href="#"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 14px', borderRadius: '8px',
                                color: '#475569', fontSize: '0.9rem', fontWeight: '500',
                                textDecoration: 'none', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <HelpCircle size={16} /> Help
                        </a>
                    </nav>
                </div>
            </header>

            <main style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
                <div className="container">
                    {children}
                </div>
            </main>

            <footer style={{
                borderTop: '1px solid rgba(0,0,0,0.06)',
                padding: '24px 0',
                marginTop: 'auto',
                backgroundColor: '#fafafa'
            }}>
                <div className="container" style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <p style={{ margin: 0 }}>© 2025 ExportShield · U.S. Export Compliance Assistant · <a href="https://www.bis.doc.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b' }}>Powered by EAR</a></p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
