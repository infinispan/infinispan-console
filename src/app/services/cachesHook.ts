import { useContext, useEffect, useState } from 'react';
import { CacheDetailContext } from '@app/providers/CacheDetailProvider';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';

export function useFetchCaches(cacheManager: string) {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.dataContainer()
        .getCaches(cacheManager)
        .then((either) => {
          if (either.isRight()) {
            setCaches(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  const reload = () => {
    setLoading(true);
  };

  return {
    loading,
    caches,
    error,
    reload
  };
}

export function useCacheEntries() {
  const { cacheEntries, totalEntriesCount, loadingEntries, errorEntries, infoEntries, reloadEntries, getByKey } =
    useContext(CacheDetailContext);
  return {
    cacheEntries,
    totalEntriesCount,
    loadingEntries,
    errorEntries,
    infoEntries,
    reloadEntries,
    getByKey
  };
}

export function useCacheDetail() {
  const { cache, loading, error, loadCache, reload, cacheManager } = useContext(CacheDetailContext);

  return { cache, loading, error, loadCache, reload, cacheManager };
}

export function useDeleteCache(cacheName: string) {
  const { addAlert } = useApiAlert();

  const onDelete = () => {
    ConsoleServices.caches()
      .deleteCache(cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onDelete
  };
}

export function useIgnoreCache(cmName: string, cacheName: string) {
  const { addAlert } = useApiAlert();

  const onIgnore = () => {
    ConsoleServices.caches()
      .ignoreCache(cmName, cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onIgnore
  };
}

export function useUndoIgnoreCache(cmName: string, cacheName: string) {
  const { addAlert } = useApiAlert();

  const onUndoIgnore = () => {
    ConsoleServices.caches()
      .undoIgnoreCache(cmName, cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onUndoIgnore
  };
}

export function useSetAvailableCache(cacheName: string) {
  const { addAlert } = useApiAlert();

  const onSetAvailable = () => {
    ConsoleServices.caches()
      .setAvailability(cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onSetAvailable
  };
}

export function useFetchCacheTemplates(cmName) {
  const [cacheTemplates, setCacheTemplates] = useState<CacheConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) {
      ConsoleServices.dataContainer()
        .getCacheConfigurationTemplates(cmName)
        .then((eitherConfigs) => {
          if (eitherConfigs.isRight()) {
            setCacheTemplates(eitherConfigs.value);
          } else {
            setError(eitherConfigs.value.message);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loading]);

  return { cacheTemplates, loading, error };
}
