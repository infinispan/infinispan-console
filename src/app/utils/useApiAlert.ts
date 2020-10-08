import { useContext } from 'react';
import { APIAlertContext } from '../providers/APIAlertProvider';

// a custom hook for using the alert context
export function useApiAlert() {
  const { alert, banner, addAlert, setBanner, removeAlert } = useContext(
    APIAlertContext
  );
  return { alert, addAlert, removeAlert };
}

/**
 * Custom Hook for banner
 */
export function useBanner() {
  const { banner, setBanner } = useContext(APIAlertContext);
  return { banner, setBanner };
}
