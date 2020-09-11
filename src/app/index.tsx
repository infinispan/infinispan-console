import * as React from 'react';
import { useEffect, useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import authenticationService from '@services/authService';
import utils from '@services/utils';
import { KeycloakService } from '@services/keycloakService';

const App: React.FunctionComponent<any> = () => {
  const [init, setInit] = useState<
    'SERVER_ERROR' | 'READY' | 'NOT_READY' | 'PENDING' | 'DONE' | 'LOGIN'
  >('PENDING');

  useEffect(() => {
    authenticationService.config().then(eitherAuth => {
      if (eitherAuth.isRight()) {
        if (eitherAuth.value.keycloakConfig) {
          // Keycloak
          KeycloakService.init(eitherAuth.value.keycloakConfig).then(result => {
            if (utils.isWelcomePage()) {
              setInit('LOGIN');
            } else {
              // if not welcome page
              if (!KeycloakService.Instance.authenticated()) {
                KeycloakService.Instance.login();
              }
              localStorage.setItem(
                'react-token',
                KeycloakService.keycloakAuth.token
              );
              localStorage.setItem(
                'react-refresh-token',
                KeycloakService.keycloakAuth.refreshToken
              );
              setTimeout(() => {
                KeycloakService.Instance.getToken().then(token => {
                  localStorage.setItem('react-token', token);
                });
              }, 60000);
              setInit('DONE');
            }
          });
        } else if (eitherAuth.value.ready) {
          setInit('READY');
        } else {
          setInit('NOT_READY');
        }
      } else {
        setInit('SERVER_ERROR');
      }
    });
  }, []);

  const load = () => {
    if (init == 'PENDING' || (!utils.isWelcomePage() && init == 'LOGIN')) {
      return <span />;
    }

    return (
      <Router basename="/console">
        <AppLayout>
          <AppRoutes init={init} />
        </AppLayout>
      </Router>
    );
  };

  return load();
};

export { App };
