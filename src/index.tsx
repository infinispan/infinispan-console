import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@app/index';
import './i18n';

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line
  const axe = require('react-axe');
  // TODO: deal with react axe errors
  // axe(React, ReactDOM, 1000);
}

ReactDOM.render(
  <React.Fragment>
    <React.Suspense fallback={'loading'}>
      <App />
    </React.Suspense>
  </React.Fragment>,
  document.getElementById('root') as HTMLElement
);
