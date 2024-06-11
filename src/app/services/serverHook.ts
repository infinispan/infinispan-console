import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { groupConnections } from '@app/utils/connectedClientUtils';

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

export function useFetchConnectedClients() {
  const [connectedClients, setConnectedClients] = useState<ConnectedClients[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.server()
        .getConnectedClients()
        .then((either) => {
          if (either.isRight()) {
            // Grouping similar connections
            setConnectedClients(groupConnections(either.value));
          } else {
            setError(either.value.message);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loading]);

  return { connectedClients, error, loading, setLoading };
}
