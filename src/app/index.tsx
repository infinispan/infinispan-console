import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import DocumentTitle from 'react-document-title';
import '@app/app.css';

const App: React.FunctionComponent<any> = () => {
  return (
    <DocumentTitle title="Infinispan Console">
      <Router basename="/console">
        <AppLayout
          welcome={
            location.pathname === '/console/welcome/' ||
            location.pathname === '/console/welcome'
          }
        >
          <AppRoutes />
        </AppLayout>
      </Router>
    </DocumentTitle>
  );
};

export { App };
