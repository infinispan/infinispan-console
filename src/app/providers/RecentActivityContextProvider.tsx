import React, {useCallback, useState} from 'react';

const initialActivityState = {
  activities: new Map(),
  pushActivity: (activity: Activity) => {},
  clearHistoryForCache: (cacheName: string) => {}
};

export const RecentActivityContext = React.createContext(initialActivityState);

const RecentActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState<Map<string, Activity[]>>(
    new Map()
  );

  const clearHistoryForCache = (cacheName:string) => {
    let currentActivities = activities;
    currentActivities[cacheName] = null;
    setActivities(currentActivities);
  };

  const pushActivity = (activity: Activity) => {
    let currentActivities = activities;
    if (currentActivities[activity.cacheName] == null) {
      currentActivities[activity.cacheName] = [];
    }

    if (currentActivities[activity.cacheName].length == 10) {
      currentActivities[activity.cacheName].shift();
    }
    currentActivities[activity.cacheName].unshift(activity);
    setActivities(currentActivities);
  };

  const contextValue = {
    activities,
    pushActivity: useCallback(pushActivity, []),
    clearHistoryForCache: useCallback(clearHistoryForCache, [])
  };

  return (
    <RecentActivityContext.Provider value={contextValue}>
      {children}
    </RecentActivityContext.Provider>
  );
};

export { RecentActivityProvider };
