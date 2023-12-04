import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@app/providers/UserContextProvider';
import { ConsoleServices } from '@services/ConsoleServices';

export function useConnectedUser() {
  const { connectedUser, error, notSecuredModeOn, logUser, notSecured, reloadAcl } = useContext(UserContext);
  return { connectedUser, error, logUser, notSecuredModeOn, notSecured, reloadAcl };
}

export function useAppInitState() {
  const { init } = useContext(UserContext);
  return { init };
}

export function useFetchAvailableUsers() {
  const [realms, setRealms] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityUsers()
        .then((either) => {
          if (either.isRight()) {
            setRealms(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    realms,
    loading,
    setLoading,
    error
  };
}
