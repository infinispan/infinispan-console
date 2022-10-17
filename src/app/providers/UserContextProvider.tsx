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
};

export const UserContext = React.createContext(initialUserState);

const UserContextProvider = ({ children }) => {
  const [loadingAcl, setLoadingAcl] = useState(
    !ConsoleServices.isWelcomePage()
  );
  const [connectedUser, setConnectedUser] = useState(
    initialUserState.connectedUser
  );
  const [notSecured, setNotSecured] = useState(initialUserState.notSecured);
  const [error, setError] = useState(initialUserState.error);
  const history = useHistory();

  useEffect(() => {
    if (loadingAcl) {
      ConsoleServices.security()
        .userAcl()
        .then((eitherAcl) => {
          if (eitherAcl.isRight()) {
            const maybeConnected = {
              name: eitherAcl.value.user,
              acl: eitherAcl.value,
            };
            setConnectedUser(maybeConnected);
          } else {
            setError(eitherAcl.value.message);
          }
          setLoadingAcl(false);
        });
    }
  }, [loadingAcl]);

  const logUser = () => {
    setError('');
    ConsoleServices.security()
      .userAcl()
      .then((eitherAcl) => {
        if (eitherAcl.isRight()) {
          const maybeConnected = {
            name: eitherAcl.value.user,
            acl: eitherAcl.value,
          };
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
              acl: eitherAcl.value,
            };
          });
        }
        return eitherAcl.isRight();
      });
  };

  const notSecuredModeOn = () => {
    setNotSecured(true);
    ConsoleServices.authentication().noSecurityMode();
    history.push('/');
  };

  const contextValue = {
    error: error,
    connectedUser: connectedUser,
    notSecured: notSecured,
    logUser: useCallback(logUser, []),
    notSecuredModeOn: useCallback(notSecuredModeOn, []),
    reloadAcl: useCallback(reloadAcl, []),
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export { UserContextProvider };
