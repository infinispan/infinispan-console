import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { formatXml } from '@app/utils/dataSerializerUtils';
import { useApiAlert } from '@utils/useApiAlert';

export function useFetchTracingConfig(cacheName: string) {
  const { addAlert } = useApiAlert();
  const [tracingEnabled, setTracingEnabled] = useState(false);
  const [tracingCategories, setTracingCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const parseEnabled = (value: string): boolean => {
    try {
      return JSON.parse(value) == 'true';
    } catch {
      return false;
    }
  };

  const parseCategories = (value: string): string[] => {
    try {
      const parsed: string = JSON.parse(value);
      return parsed.replace('[', '').replace(']', '').split(', ');
    } catch {
      return [];
    }
  };

  const update = () => {
    ConsoleServices.caches()
      .setConfigAttribute(cacheName, 'tracing.enabled', tracingEnabled + '')
      .then((actionResponse) => {
        if (tracingCategories.length > 0) {
          ConsoleServices.caches()
            .setConfigAttribute(cacheName, 'tracing.categories', tracingCategories.toString())
            .then((actionResponse) => {
              addAlert(actionResponse);
            });
        }
      });
  };

  useEffect(() => {
    if (loading) {
      ConsoleServices.caches()
        .getConfigAttribute(cacheName, 'tracing.enabled')
        .then((r) => {
          if (r.isRight()) {
            const isEnabled = parseEnabled(r.value);
            setTracingEnabled(isEnabled);
            return isEnabled;
          } else {
            setError(r.value.message);
            return false;
          }
        })
        .then((isEnabled) => {
          if (!isEnabled) {
            setLoading(false);
          }
        });
    }
  }, [loading]);

  useEffect(() => {
    if (tracingEnabled) {
      ConsoleServices.caches()
        .getConfigAttribute(cacheName, 'tracing.categories')
        .then((r) => {
          if (r.isRight()) {
            setTracingCategories(parseCategories(r.value));
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [tracingEnabled]);

  return { loading, error, tracingEnabled, tracingCategories, setTracingEnabled, setTracingCategories, update };
}

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
