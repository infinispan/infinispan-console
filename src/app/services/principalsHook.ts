import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchAvailablePrincipals() {
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityPrincipals()
        .then((either) => {
          if (either.isRight()) {
            either.value.sort((r1, r2) => {
              return r1.name < r2.name ? -1 : 1;
            });
            setPrincipals(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    principals,
    loading,
    setLoading,
    error
  };
}
