import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { ConsoleServices } from '@services/ConsoleServices';
import { UserContextProvider } from '@app/providers/UserContextProvider';
import { ThemeProvider } from './providers/ThemeProvider';

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
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </UserContextProvider>
      </ThemeProvider>
    </Router>
  );
};

export { App };
