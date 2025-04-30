import { useContext } from 'react';
import { APIAlertContext } from '@app/providers/APIAlertProvider';

// a custom hook for using the alert context
export function useApiAlert() {
  const { alertMap, addAlert, removeAlert } = useContext(APIAlertContext);
  return { alertMap, addAlert, removeAlert };
}

/**
 * Custom Hook for banner
 */
export function useBanner() {
  const { bannerMap, addBanner, removeBanner } = useContext(APIAlertContext);
  return { bannerMap, addBanner, removeBanner };
}
