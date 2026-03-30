import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { formatXml } from '@app/utils/dataSerializerUtils';
import { useApiAlert } from '@utils/useApiAlert';
import {
  CONF_MUTABLE_TRACING_CATEGORIES,
  CONF_MUTABLE_TRACING_ENABLED,
} from '@services/cacheConfigUtils';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useCacheAliases(cacheName: string) {
  const { addAlert } = useApiAlert();
  const [aliases, setAliases] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (cacheName: string) => {
    const newAliases = aliases.join(' ');
    ConsoleServices.caches()
      .setConfigAttribute(cacheName, 'aliases', newAliases)
      .then((actionResponse) => {
        if (actionResponse.success) {
          addAlert(actionResponse);
        } else {
          setError(actionResponse.message);
        }
      });
  };

  const parseAliases = (value: string): string[] => {
    try {
      const parsed: string = JSON.parse(value);
      if (parsed === '[]') {
        return [];
      }
      return parsed.replace('[', '').replace(']', '').split(', ');
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (loading) {
      setError('');
      ConsoleServices.caches()
        .getConfigAttribute(cacheName, 'aliases')
        .then((r) => {
          if (r.isRight()) {
            setAliases(parseAliases(r.value));
          } else {
            setError(r.value.message);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [loading]);

  return { loading, setLoading, error, aliases, setAliases, update };
}

export function useFetchConfigurationYAML(cacheName: string) {
  const {
    data: configuration,
    loading,
    error,
  } = useServiceCall<string>(
    () => ConsoleServices.caches().getConfiguration(cacheName, 'yaml'),
    '',
  );

  return { loading, error, configuration };
}

export function useFetchConfigurationXML(cacheName: string) {
  const {
    data: configuration,
    loading,
    error,
  } = useServiceCall<string>(
    () => ConsoleServices.caches().getConfiguration(cacheName, 'xml'),
    '',
    { transform: formatXml },
  );

  return { loading, error, configuration };
}

export function useFetchEditableConfiguration(cacheName: string) {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [errorConfig, setErrorConfig] = useState('');
  const [editableConfig, setEditableConfig] = useState<EditableConfig>();

  useEffect(() => {
    ConsoleServices.caches()
      .getEditableConfig(cacheName)
      .then((r) => {
        if (r.isRight()) {
          setEditableConfig(r.value);
        } else {
          setErrorConfig(r.value.message);
        }
      })
      .finally(() => setLoadingConfig(false));
  }, []);
  return { loadingConfig, errorConfig, editableConfig };
}
