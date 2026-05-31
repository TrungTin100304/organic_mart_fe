import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Global error handlers to catch uncaught exceptions and unhandled promise rejections
// This helps surface errors (like invalid JSON parse) in the console with helpful context
// and prevents them from failing silently in production builds during development.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // event.reason may be an Error or any value thrown
    // eslint-disable-next-line no-console
    console.error('Unhandled promise rejection:', event.reason);
  });

  window.addEventListener('error', (event) => {
    // Some browsers provide event.error (Error object)
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', (event as ErrorEvent).error || (event as ErrorEvent).message || event);
  });
}

