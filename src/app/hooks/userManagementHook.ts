import { useContext } from 'react';
import { UserContext } from '@app/providers/UserContextProvider';
import { ConsoleServices } from '@services/ConsoleServices';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useConnectedUser() {
  const {
    connectedUser,
    error,
    notSecuredModeOn,
    logUser,
    notSecured,
    reloadAcl,
  } = useContext(UserContext);
  return {
    connectedUser,
    error,
    logUser,
    notSecuredModeOn,
    notSecured,
    reloadAcl,
  };
}

export function useAppInitState() {
  const { init } = useContext(UserContext);
  return { init };
}

export function useFetchAvailableUsers() {
  const {
    data: realms,
    loading,
    setLoading,
    error,
  } = useServiceCall<Map<string, string[]>>(
    () => ConsoleServices.security().getSecurityUsers(),
    new Map(),
  );

  return { realms, loading, setLoading, error };
}
