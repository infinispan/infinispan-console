import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-charts.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { ConsoleServices } from '@services/ConsoleServices';
import { UserContextProvider } from '@app/providers/UserContextProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { RollingUpgradeDetectionProvider } from '@app/providers/RollingUpgradeDetectionProvider';
import { APIAlertProvider } from '@app/providers/APIAlertProvider';

const App = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const searchParams = new URL(window.location).searchParams;
  // local dev mode basic
  const user = searchParams.get('user');
  const password = searchParams.get('password');

  if (user != null && password != null) {
    ConsoleServices.init(user, password);
  } else {
    ConsoleServices.init();
  }

  return (
    <Router basename="/console">
      <ThemeProvider>
        <UserContextProvider>
          <APIAlertProvider>
            <RollingUpgradeDetectionProvider>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </RollingUpgradeDetectionProvider>
          </APIAlertProvider>
        </UserContextProvider>
      </ThemeProvider>
    </Router>
  );
};

export { App };
