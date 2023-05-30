import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchVersion() {
  const [version, setVersion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

export function useFetchLatestVersion() {
  const [latestVersion, setLatestVersion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading && latestVersion == '') {
      ConsoleServices.server()
        .getLatestVersion()
        .then((eitherVersion) => {
          if (eitherVersion.isRight()) {
            setLatestVersion(eitherVersion.value);
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
    latestVersion,
    error
  };
}
