
import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Helper to access the global logger safely
const safeLog = (msg: string, type: 'info' | 'error' = 'info') => {
    const w = window as any;
    if (w.logToScreen) w.logToScreen(msg, type);
    else console[type](msg);
};

safeLog("index.tsx: Imports resolved. Starting mount sequence...");

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = { hasError: false, error: null };
    // Explicitly declare props to fix TS error in some environments
    public readonly props: Readonly<ErrorBoundaryProps>;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.props = props;
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        safeLog("React Boundary Caught: " + error.message, 'error');
        console.error(errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: '40px', 
                    color: '#ff6b6b', 
                    fontFamily: 'monospace', 
                    background: '#1a0505', 
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Application Error</h1>
                    <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '4px' }}>
                        {this.state.error?.message}
                    </pre>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ 
                            marginTop: '20px', 
                            padding: '10px 20px', 
                            background: '#8c1c0b', 
                            color: 'white', 
                            border: '1px solid #ff6b6b', 
                            cursor: 'pointer' 
                        }}
                    >
                        Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const mount = () => {
    safeLog("Mounting React Root...");
    const rootEl = document.getElementById('root');
    
    if (!rootEl) {
        safeLog("FATAL: #root element not found!", 'error');
        return;
    }

    try {
        const root = createRoot(rootEl);
        root.render(
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        );
        safeLog("Render command dispatched.");

        // CLEAR WATCHDOG
        const w = window as any;
        if (w.bootTimeout) clearTimeout(w.bootTimeout);

        // Cleanup loader
        setTimeout(() => {
            const loader = document.getElementById('app-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    if (loader.parentNode) loader.parentNode.removeChild(loader);
                }, 500);
            }
        }, 800);

    } catch (e: any) {
        safeLog("Mount Exception: " + (e.message || String(e)), 'error');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}
