import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { formatXml } from '@app/utils/dataSerializerUtils';

export function useFetchConfigurationYAML(cacheName: string) {
  const [configuration, setConfiguration] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.caches()
        .getConfiguration(cacheName, 'yaml')
        .then((r) => {
          if (r.isRight()) {
            setConfiguration(r.value);
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, configuration };
}

export function useFetchConfigurationXML(cacheName: string) {
  const [configuration, setConfiguration] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.caches()
        .getConfiguration(cacheName, 'xml')
        .then((r) => {
          if (r.isRight()) {
            setConfiguration(formatXml(r.value));
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, configuration };
}
