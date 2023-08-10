import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@app/index';
import './i18n';

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line
  const axe = require('react-axe');
  // TODO: deal with react axe errors
  // axe(React, ReactDOM, 1000);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.Fragment>
    <React.Suspense fallback={'loading'}>
      <App />
    </React.Suspense>
  </React.Fragment>
);
