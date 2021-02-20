import React, {useCallback, useEffect, useState} from 'react';
import {ConsoleServices} from "@services/ConsoleServices";
import {useHistory} from "react-router";

const initialUserState = {
  error: '',
  userName: '',
  notSecured: false,
  logUser: () => {},
  notSecuredModeOn: () => {},
};

export const UserContext = React.createContext(initialUserState);

const UserContextProvider = ({ children }) => {
  const [userName, setUserName] = useState(initialUserState.userName);
  const [notSecured, setNotSecured] = useState(initialUserState.notSecured);
  const [error, setError] = useState(initialUserState.error);
  const history = useHistory();

  const logUser = () => {
      setError('');
      setUserName('connected');
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
    notSecuredModeOn: useCallback(notSecuredModeOn, []),
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContextProvider };
