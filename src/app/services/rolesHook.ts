import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchAvailableRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityRoles()
        .then((either) => {
          if (either.isRight()) {
            setRoles(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    roles,
    loading,
    error
  };
}
