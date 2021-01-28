import React, {useCallback, useEffect, useState} from 'react';
import {ConsoleServices} from "@services/ConsoleServices";
import {useHistory} from "react-router";

const initialUserState = {
  error: '',
  connectedUser: {name: '', acl: undefined} as ConnectedUser,
  notSecured: false,
  logUser: (userName: string, password: string) => {},
  logOut: () => {},
  notSecuredModeOn: () => {},
  reloadAcl: () => {}
};

export const UserContext = React.createContext(initialUserState);

const UserContextProvider = ({ children }) => {
  const [connectedUser, setConnectedUser] = useState<ConnectedUser>(initialUserState.connectedUser);
  const [notSecured, setNotSecured] = useState(initialUserState.notSecured);
  const [error, setError] = useState(initialUserState.error);
  const history = useHistory();

  const logUser = (userName: string, password: string) => {
      setError('');
      ConsoleServices.authentication().login(userName, password)
        .then((loggingResult) => {
          if (loggingResult.success) {
            ConsoleServices.user().userAcl().then(eitherAcl => {
              if (eitherAcl.isRight()) {
                const maybeConnected = {name: userName, acl: eitherAcl.value};
                if (ConsoleServices.user().hasNonePermission(maybeConnected)) {
                  setError('User ' + userName + ' lacks permission to use the console');
                } else {
                  setConnectedUser(maybeConnected);
                }
              }
            })
          } else {
            setError(loggingResult.message);
          }
        })
  };

  const reloadAcl = () => {
    ConsoleServices.user().userAcl().then(eitherAcl => {
      if (eitherAcl.isRight()) {
        setConnectedUser({name: connectedUser.name, acl: eitherAcl.value});
      }
    })
  };

  const logOut = () => {
    setError('');
    setConnectedUser({name: '', acl: undefined});
    ConsoleServices.authentication().logOut();
    history.push('/welcome');
  };

  const notSecuredModeOn = () => {
    setNotSecured(true);
    ConsoleServices.authentication().noSecurityMode();
    history.push('/');
  };

  const contextValue = {
    error: error,
    connectedUser,
    notSecured,
    logUser: useCallback(logUser, []),
    logOut: useCallback(logOut, []),
    notSecuredModeOn: useCallback(notSecuredModeOn, []),
    reloadAcl: useCallback(reloadAcl, [])
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContextProvider };
