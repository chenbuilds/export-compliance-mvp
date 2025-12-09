import React, { useState, useEffect } from 'react';
import AgentConsole from './components/AgentConsole';
import Dashboard from './components/Dashboard';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-100 m-8">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong.</h2>
                    <p className="text-slate-600 mb-4">The application encountered an unexpected error.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-sm font-medium"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const App = () => {
    // Basic Client-Side Routing
    const path = window.location.pathname;
    const isAdmin = path === '/admin';

    // Disable default browser context menu for app-like feel (optional)
    useEffect(() => {
        const handleContext = (e) => {
            // e.preventDefault(); 
        };
        window.addEventListener('contextmenu', handleContext);
        return () => window.removeEventListener('contextmenu', handleContext);
    }, []);

    return (
        <ErrorBoundary>
            {isAdmin ? <Dashboard /> : <AgentConsole />}
        </ErrorBoundary>
    );
};

export default App;
