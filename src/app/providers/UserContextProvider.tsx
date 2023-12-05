import React, { useCallback, useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useHistory } from 'react-router';
import { KeycloakService } from '@services/keycloakService';

const initialUserState = {
  error: '',
  connectedUser: { name: '', acl: undefined } as ConnectedUser,
  notSecured: false,
  logUser: () => {},
  notSecuredModeOn: () => {},
  reloadAcl: (): Promise<boolean> => {
    return Promise.resolve(true);
  },
  init: 'PENDING'
};

export const UserContext = React.createContext(initialUserState);

const UserContextProvider = ({ children }) => {
  const [loadingAcl, setLoadingAcl] = useState(!ConsoleServices.isWelcomePage());
  const [connectedUser, setConnectedUser] = useState(initialUserState.connectedUser);
  const [notSecured, setNotSecured] = useState(initialUserState.notSecured);
  const [error, setError] = useState(initialUserState.error);
  const history = useHistory();
  const [init, setInit] = useState<
    'SERVER_ERROR' | 'READY' | 'NOT_READY' | 'PENDING' | 'DONE' | 'LOGIN' | 'HTTP_LOGIN'
  >('PENDING');

  useEffect(() => {
    if (init == 'PENDING') {
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
                .then(() => {
                  // if not welcome page
                  if (!KeycloakService.Instance.authenticated()) {
                    KeycloakService.Instance.login();
                  }
                  localStorage.setItem('react-token', KeycloakService.keycloakAuth.token as string);
                  localStorage.setItem('react-refresh-token', KeycloakService.keycloakAuth.refreshToken as string);
                  setTimeout(() => {
                    KeycloakService.Instance.getToken().then((token) => {
                      localStorage.setItem('react-token', token);
                    });
                  }, 60000);
                  setInit('DONE');
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
    }
  }, []);

  useEffect(() => {
    if (loadingAcl && init != 'PENDING') {
      ConsoleServices.security()
        .userAcl()
        .then((eitherAcl) => {
          if (eitherAcl.isRight()) {
            const maybeConnected = { name: eitherAcl.value.user, acl: eitherAcl.value };
            setConnectedUser(maybeConnected);
          } else {
            setError(eitherAcl.value.message);
          }
          setLoadingAcl(false);
        });
    }
  }, [loadingAcl, init]);

  const logUser = () => {
    setError('');
    ConsoleServices.security()
      .userAcl()
      .then((eitherAcl) => {
        if (eitherAcl.isRight()) {
          const maybeConnected = { name: eitherAcl.value.user, acl: eitherAcl.value };
          setConnectedUser(maybeConnected);
        } else {
          setError(eitherAcl.value.message);
        }
      });
  };

  const reloadAcl = (): Promise<boolean> => {
    return ConsoleServices.security()
      .userAcl()
      .then((eitherAcl) => {
        if (eitherAcl.isRight()) {
          setConnectedUser((prevState) => {
            return {
              ...prevState,
              acl: eitherAcl.value
            };
          });
        }
        return eitherAcl.isRight();
      });
  };

  const notSecuredModeOn = () => {
    setNotSecured(true);
    ConsoleServices.authentication().noSecurityMode();
    history.push('/' + history.location.search);
  };

  const contextValue = {
    error: error,
    connectedUser: connectedUser,
    notSecured: notSecured,
    logUser: useCallback(logUser, []),
    notSecuredModeOn: useCallback(notSecuredModeOn, []),
    reloadAcl: useCallback(reloadAcl, []),
    init: init
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export { UserContextProvider };
