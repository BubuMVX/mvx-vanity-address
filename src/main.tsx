import { LibraryConfig } from '@multiversx/sdk-core/out';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './assets/scss/styles.scss';

LibraryConfig.DefaultAddressHrp = 'vibe';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
