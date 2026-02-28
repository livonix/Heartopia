import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './lib/languageContext';
import { SocketProvider } from './lib/socketContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SocketProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </SocketProvider>
  </React.StrictMode>,
);
