import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@utils/useApiAlert';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useFetchGlobalStats() {
  const {
    data: stats,
    loading,
    error,
    reload,
  } = useServiceCall<CacheManagerStats>(
    () => ConsoleServices.dataContainer().getCacheManagerStats(),
    { statistics_enabled: false },
  );

  return { loading, stats, error, reload };
}

export function useSearchStats(cacheName: string) {
  const {
    data: stats,
    loading,
    error,
    setLoading,
  } = useServiceCall<SearchStats>(
    () => ConsoleServices.search().retrieveStats(cacheName),
    { reindexing: false, query: [], index: [] },
  );

  return { loading, stats, error, setLoading };
}

export function useClearStats(
  name: string,
  type: 'query' | 'cache-metrics' | 'global-stats',
  action: () => void,
) {
  const { addAlert } = useApiAlert();
  const onClearStats = () => {
    let actionResponsePromise: undefined | Promise<ActionResponse>;
    if (type == 'query') {
      actionResponsePromise = ConsoleServices.search().clearQueryStats(name);
    } else if (type == 'cache-metrics') {
      actionResponsePromise = ConsoleServices.caches().clearStats(name);
    } else if (type == 'global-stats') {
      actionResponsePromise =
        ConsoleServices.dataContainer().clearCacheManagerStats();
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
    onClearStats,
  };
}
