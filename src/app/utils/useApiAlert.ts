import { useContext } from 'react';
import { APIAlertContext } from '../providers/APIAlertProvider';

// a custom hook for using the alert context
export function useApiAlert() {
  const { alert, addAlert, removeAlert } = useContext(APIAlertContext);
  return { alert, addAlert, removeAlert };
}
