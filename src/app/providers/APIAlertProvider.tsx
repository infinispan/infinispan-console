import React, { useCallback, useState } from 'react';

const emptyAlert: ActionResponse = { message: '', success: true };

const initialAlertState = {
  alert: { message: '', success: true },
  addAlert: (alert: ActionResponse) => {},
  removeAlert: () => {}
};

export const APIAlertContext = React.createContext(initialAlertState);

const APIAlertProvider = ({ children }) => {
  const [alert, setAlert] = useState<ActionResponse>(emptyAlert);

  const removeAlert = () => setAlert(emptyAlert);

  const addAlert = actionResponse => {
    setAlert(actionResponse);
    setTimeout(() => {
      removeAlert();
    }, 5000);
  };

  const contextValue = {
    alert,
    addAlert: useCallback(addAlert, []),
    removeAlert: useCallback(removeAlert, [])
  };

  return (
    <APIAlertContext.Provider value={contextValue}>
      {children}
    </APIAlertContext.Provider>
  );
};

export { APIAlertProvider };
