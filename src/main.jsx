import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { pdfjs } from 'react-pdf';

import App from './app.jsx';
import AuthProvider from './contexts/auth/authProvide';
import ErrorBoundary from './utils/ErrorBoundary';

import './styles/theme.css';
import './styles/app.css';
import './styles/theme-override.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

// Helpful debug breadcrumb
// eslint-disable-next-line no-console
console.info('[DAN] boot', { mode: import.meta.env.MODE, time: new Date().toISOString() });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);