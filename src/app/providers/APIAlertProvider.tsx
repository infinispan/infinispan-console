import React, { useCallback, useState } from 'react';

const initialAlertState = {
  bannerMap: new Map(),
  addBanner: (id: string, message: string) => {},
  removeBanner: (id: string) => {},
  alertMap: new Map(),
  addAlert: (alert: ActionResponse) => {},
  removeAlert: (pos: number) => {},
};

export const APIAlertContext = React.createContext(initialAlertState);

export const CACHES_BANNER = 'caches';
export const ROLLING_UPGRADE_BANNER = 'rolling';

let alertCounter = 0;

const APIAlertProvider = ({ children }) => {
  const [alertMap, setAlertMap] = useState(new Map());
  const [bannerMap, setBannerMap] = useState(new Map());

  const addBanner = useCallback((id: string, message: string) => {
    setBannerMap((prev) => new Map(prev).set(id, message));
  }, []);

  const removeBanner = useCallback((id: string) => {
    setBannerMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const removeAlert = useCallback((id: number) => {
    setAlertMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const addAlert = useCallback(
    (actionResponse) => {
      const id = alertCounter++;
      setAlertMap((prev) => new Map(prev).set(id, actionResponse));
      setTimeout(() => {
        removeAlert(id);
      }, 10000);
    },
    [removeAlert],
  );

  const contextValue = {
    bannerMap,
    addBanner,
    removeBanner,
    alertMap,
    addAlert,
    removeAlert,
  };

  return (
    <APIAlertContext.Provider value={contextValue}>
      {children}
    </APIAlertContext.Provider>
  );
};

export { APIAlertProvider };
