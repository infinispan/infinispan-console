import { useEffect, useState } from 'react';
import serverService from '@services/serverService';

export function useFetchVersion() {
  const [version, setVersion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      serverService
        .getVersion()
        .then((eitherVersion) => {
          if (eitherVersion.isRight()) {
            setVersion(eitherVersion.value);
          } else {
            setError('Unable to retrieve Infinispan Version');
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    loading,
    version,
    error,
  };
}
