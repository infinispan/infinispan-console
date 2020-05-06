import { useContext } from 'react';
import { RecentActivityContext } from '../providers/RecentActivityContextProvider';

// a custom hook for using the recent activity context
export function useRecentActivity() {
  const { activities, pushActivity } = useContext(RecentActivityContext);
  return { activities, pushActivity };
}
