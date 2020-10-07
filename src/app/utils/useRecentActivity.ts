import { useContext } from 'react';
import { RecentActivityContext } from '../providers/RecentActivityContextProvider';

// a custom hook for using the recent activity context
export function useRecentActivity() {
  const { activities, pushActivity, clearHistoryForCache } = useContext(
    RecentActivityContext
  );
  return { activities, pushActivity, clearHistoryForCache };
}
