import React, { useEffect, useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { KeycloakService } from '@services/keycloakService';
import { ConsoleServices } from '@services/ConsoleServices';
import { UserContextProvider } from '@app/providers/UserContextProvider';

const App = () => {
  const [init, setInit] = useState<
    'SERVER_ERROR' | 'READY' | 'NOT_READY' | 'PENDING' | 'DONE' | 'LOGIN' | 'HTTP_LOGIN'
  >('PENDING');
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

  useEffect(() => {
    ConsoleServices.authentication()
      .config()
      .then((eitherAuth) => {
        if (eitherAuth.isRight()) {
          if (eitherAuth.value.keycloakConfig) {
            // Keycloak
            KeycloakService.init(eitherAuth.value.keycloakConfig)
              .catch((err) => {
                console.error(err);
                setInit('SERVER_ERROR');
              })
              .then((result) => {
                if (ConsoleServices.isWelcomePage()) {
                  setInit('LOGIN');
                } else {
                  // if not welcome page
                  if (!KeycloakService.Instance.authenticated()) {
                    KeycloakService.Instance.login();
                  }
                  localStorage.setItem('react-token', KeycloakService.keycloakAuth.token);
                  localStorage.setItem('react-refresh-token', KeycloakService.keycloakAuth.refreshToken);
                  setTimeout(() => {
                    KeycloakService.Instance.getToken().then((token) => {
                      localStorage.setItem('react-token', token);
                    });
                  }, 60000);
                  setInit('DONE');
                }
              });
          } else if (eitherAuth.value.ready) {
            if (eitherAuth.value.mode === 'HTTP') {
              setInit('HTTP_LOGIN');
            } else {
              ConsoleServices.authentication().noSecurityMode();
              setInit('READY');
            }
          } else {
            setInit('NOT_READY');
          }
        } else {
          setInit('SERVER_ERROR');
        }
      });
  }, []);

  const load = () => {
    return (
      <Router basename="/console">
        <UserContextProvider>
          <AppLayout init={init}>
            <AppRoutes init={init} />
          </AppLayout>
        </UserContextProvider>
      </Router>
    );
  };

  return load();
};

export { App };
