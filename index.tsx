
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './lib/languageContext';
import { SocketProvider } from './lib/socketContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </LanguageProvider>
  </React.StrictMode>
);
