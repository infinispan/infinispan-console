import React, {useCallback, useEffect, useState} from 'react';
import {ConsoleServices} from "@services/ConsoleServices";
import {useHistory} from "react-router";

const initialUserState = {
  error: '',
  userName: '',
  notSecured: false,
  logUser: (userName: string, password: string) => {},
  logOut: () => {},
  notSecuredModeOn: () => {},
};

export const UserContext = React.createContext(initialUserState);

const UserContextProvider = ({ children }) => {
  const [userName, setUserName] = useState(initialUserState.userName);
  const [notSecured, setNotSecured] = useState(initialUserState.notSecured);
  const [error, setError] = useState(initialUserState.error);
  const history = useHistory();

  useEffect(() => {
    if (ConsoleServices.isDevMode()) {
      setUserName(ConsoleServices.authentication().getUserName());
    }
  } , [])
  const logUser = (userName: string, password: string) => {
      setError('');
      ConsoleServices.authentication().login(userName, password)
        .then((loggingResult) => {
          if (loggingResult.success) {
            setUserName(userName);
          } else {
            setError(loggingResult.message);
          }
        })
  };

  const logOut = () => {
    setError('');
    setUserName('');
    ConsoleServices.authentication().logOut();
    history.push('/welcome');
  };

  const notSecuredModeOn = () => {
    setUserName('');
    setNotSecured(true);
    ConsoleServices.authentication().noSecurityMode();
    history.push('/');
  };

  const contextValue = {
    error: error,
    userName,
    notSecured,
    logUser: useCallback(logUser, []),
    logOut: useCallback(logOut, []),
    notSecuredModeOn: useCallback(notSecuredModeOn, []),
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContextProvider };
