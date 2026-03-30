import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { groupConnections } from '@app/utils/connectedClientUtils';
import { useServiceCall } from '@app/hooks/useServiceCall';

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
    error,
  };
}

export function useFetchConnectedClients() {
  const {
    data: connectedClients,
    error,
    loading,
    setLoading,
  } = useServiceCall<ConnectedClients[]>(
    () => ConsoleServices.server().getConnectedClients(),
    [],
    { transform: groupConnections },
  );

  return { connectedClients, error, loading, setLoading };
}
