import React, { useCallback, useState } from 'react';

const initialAlertState = {
  banner: '',
  setBanner: (banner: string) => {},
  alertMap: new Map(),
  addAlert: (alert: ActionResponse) => {},
  removeAlert: (pos: number) => {},
};

export const APIAlertContext = React.createContext(initialAlertState);

const APIAlertProvider = ({ children }) => {
  const [alertMap, setAlertMap] = useState(new Map());
  const [banner, setBanner] = useState<string>('');

  const removeAlert = (id: number) => {
    alertMap.delete(id);
    setAlertMap(new Map(alertMap));
  };

  const addAlert = (actionResponse) => {
    let time = new Date().getTime();
    setAlertMap(new Map(alertMap.set(time, actionResponse)));
    setTimeout(() => {
      removeAlert(time);
    }, 10000);
  };

  const contextValue = {
    banner,
    setBanner: useCallback(setBanner, []),
    alertMap,
    addAlert: useCallback(addAlert, []),
    removeAlert: useCallback(removeAlert, []),
  };

  return (
    <APIAlertContext.Provider value={contextValue}>
      {children}
    </APIAlertContext.Provider>
  );
};

export { APIAlertProvider };
