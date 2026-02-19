import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@app/index';
import './i18n';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { WrappedMessageService } from '@services/wrappedMessageService';

loader.config({ monaco });

// Initialize WrappedMessage decoder for protobuf support
WrappedMessageService.init()
  .then(() => {
    console.log('WrappedMessage support enabled');
  })
  .catch((error) => {
    console.error('Failed to initialize WrappedMessage support:', error);
    // App can still work, just won't decode WrappedMessage
  });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.Suspense fallback={'loading'}>
    <App />
  </React.Suspense>
);
