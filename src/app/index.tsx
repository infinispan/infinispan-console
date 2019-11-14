import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import {BrowserRouter as Router} from 'react-router-dom';
import {AppLayout} from '@app/AppLayout/AppLayout';
import {AppRoutes, isLogged} from '@app/routes';
import DocumentTitle from 'react-document-title';
import '@app/app.css';
import InfinispanLogin from "@app/Login/InfinispanLogin";

const App: React.FunctionComponent = () => {
  if (!isLogged) {
    return <InfinispanLogin/>
  } else {
    return <DocumentTitle title="Infinispan Console">
      <Router basename="/console">
        <AppLayout>
          <AppRoutes/>
        </AppLayout>
      </Router>
    </DocumentTitle>
  }
};

export {App};
