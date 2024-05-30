import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@app/index';
import './i18n';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

loader.config({ monaco });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.Suspense fallback={'loading'}>
    <App />
  </React.Suspense>
);
