
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Fallback Error Component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{
    padding: '20px', 
    color: '#ff6b6b', 
    backgroundColor: '#1a0505', 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
    fontFamily: 'monospace'
  }}>
    <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Application Error</h2>
    <p style={{ marginBottom: '10px' }}>The game failed to start. Please check the console.</p>
    <pre style={{ 
      backgroundColor: '#000', 
      padding: '15px', 
      borderRadius: '5px', 
      maxWidth: '90%', 
      overflow: 'auto' 
    }}>
      {error.message}
    </pre>
  </div>
);

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error("CRITICAL RENDER ERROR:", e);
  // Manual fallback if React fails completely
  rootElement.innerHTML = `
    <div style="color:red; padding:20px; font-family:sans-serif;">
      <h1>Critical Startup Error</h1>
      <p>${e instanceof Error ? e.message : String(e)}</p>
    </div>
  `;
}
