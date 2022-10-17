import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchVersion() {
  const [version, setVersion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading && version == '') {
      ConsoleServices.server()
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
    setLoading,
    loading,
    version,
    error
  };
}
