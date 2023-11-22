import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@utils/useApiAlert';

export function useFetchGlobalStats() {
  const [stats, setStats] = useState<CacheManagerStats>({
    name: '',
    statistics_enabled: false,
    hits: -1,
    retrievals: -1,
    remove_misses: -1,
    remove_hits: -1,
    evictions: -1,
    stores: -1,
    misses: -1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.dataContainer()
        .getDefaultCacheManager()
        .then((eitherDefaultCm) => {
          if (eitherDefaultCm.isRight()) {
            ConsoleServices.dataContainer()
              .getCacheManagerStats(eitherDefaultCm.value.name)
              .then((eitherDetailedStats) => {
                if (eitherDetailedStats.isRight()) {
                  setStats(eitherDetailedStats.value);
                } else {
                  setError(eitherDetailedStats.value.message);
                }
              });
          } else {
            setError(eitherDefaultCm.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  const reload = () => {
    if (!loading) setLoading(true);
  };

  return {
    loading,
    stats,
    error,
    reload
  };
}

export function useSearchStats(cacheName: string) {
  const [stats, setStats] = useState<SearchStats>({
    reindexing: false,
    query: [],
    index: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.search()
        .retrieveStats(cacheName)
        .then((eitherStats) => {
          if (eitherStats.isRight()) {
            setStats(eitherStats.value);
          } else {
            setError(eitherStats.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    loading,
    stats,
    error,
    setLoading
  };
}

export function useClearStats(name: string, type: 'query' | 'cache-metrics' | 'global-stats', action: () => void) {
  const { addAlert } = useApiAlert();
  const onClearStats = () => {
    let actionResponsePromise: undefined | Promise<ActionResponse>;
    if (type == 'query') {
      actionResponsePromise = ConsoleServices.search().clearQueryStats(name);
    } else if (type == 'cache-metrics') {
      actionResponsePromise = ConsoleServices.caches().clearStats(name);
    } else if (type == 'global-stats') {
      actionResponsePromise = ConsoleServices.dataContainer().clearCacheManagerStats(name);
    } else {
      console.warn('Requesting a reset type that is not available. Do nothing');
      actionResponsePromise = undefined;
    }

    if (actionResponsePromise) {
      actionResponsePromise.then((actionResponse) => {
        addAlert(actionResponse);
        action();
      });
    } else {
      action();
    }
  };

  return {
    onClearStats
  };
}
