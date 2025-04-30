import React, { useCallback, useState } from 'react';

const initialAlertState = {
  bannerMap: new Map(),
  addBanner: (id: string, message: string) => {},
  removeBanner: (id: string) => {},
  alertMap: new Map(),
  addAlert: (alert: ActionResponse) => {},
  removeAlert: (pos: number) => {}
};

export const APIAlertContext = React.createContext(initialAlertState);

export const CACHES_BANNER = 'caches';
export const ROLLING_UPGRADE_BANNER = 'rolling';

const APIAlertProvider = ({ children }) => {
  const [alertMap, setAlertMap] = useState(new Map());
  const [bannerMap, setBannerMap] = useState(new Map());

  const addBanner = (id: string, message: string) => {
    setBannerMap(new Map(bannerMap.set(id, message)));
  };

  const removeBanner = (id: string) => {
    bannerMap.delete(id);
    setBannerMap(new Map(bannerMap));
  };

  const addAlert = (actionResponse) => {
    const time = new Date().getTime();
    setAlertMap(new Map(alertMap.set(time, actionResponse)));
    setTimeout(() => {
      removeAlert(time);
    }, 10000);
  };

  const removeAlert = (id: number) => {
    alertMap.delete(id);
    setAlertMap(new Map(alertMap));
  };

  const contextValue = {
    bannerMap,
    addBanner: useCallback(addBanner, []),
    removeBanner: useCallback(removeBanner, []),
    alertMap,
    addAlert: useCallback(addAlert, []),
    removeAlert: useCallback(removeAlert, [])
  };

  return <APIAlertContext.Provider value={contextValue}>{children}</APIAlertContext.Provider>;
};

export { APIAlertProvider };
