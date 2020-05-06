import React, { useCallback, useState } from 'react';

const initialActivityState = {
  activities: [] as Activity[],
  pushActivity: (activity: Activity) => {}
};

export const RecentActivityContext = React.createContext(initialActivityState);

const RecentActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const pushActivity = activity => {
    let currentActivities = activities;
    if (currentActivities.length == 10) {
      currentActivities.shift();
    }
    currentActivities.unshift(activity);
    setActivities(currentActivities);
  };

  const contextValue = {
    activities,
    pushActivity: useCallback(pushActivity, [])
  };

  return (
    <RecentActivityContext.Provider value={contextValue}>
      {children}
    </RecentActivityContext.Provider>
  );
};

export { RecentActivityProvider };
