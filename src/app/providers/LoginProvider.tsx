import React, { useCallback, useState } from 'react';
import { LoginForm } from '@app/Welcome/LoginForm';

const initialAlertState = {
  alert: { message: '', success: true },
  addAlert: (alert: ActionResponse) => {},
  removeAlert: () => {},
};

export const LoginContext = React.createContext(initialAlertState);

const LoginProvider = ({ children }) => {
  const [connected, setIsConnected] = useState<boolean>(false);

  const removeAlert = () => setAlert(emptyAlert);

  const addAlert = (actionResponse) => {
    setAlert(actionResponse);
    setTimeout(() => {
      removeAlert();
    }, 5000);
  };

  const contextValue = {
    alert,
    addAlert: useCallback(addAlert, []),
    removeAlert: useCallback(removeAlert, []),
  };

  return (
    <LoginContext.Provider value={contextValue}>
      <LoginForm
        isModalOpen={connected}
        closeModal={() => console.log('go to welcome page')}
      />
      {children}
    </LoginContext.Provider>
  );
};

export { LoginProvider };
