import { useContext } from 'react';
import { CacheDetailContext } from '@app/providers/CacheDetailProvider';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useFetchCaches() {
  const {
    data: caches,
    loading,
    error,
    reload,
  } = useServiceCall<CacheInfo[]>(
    () => ConsoleServices.dataContainer().getCaches(),
    [],
  );

  return { loading, caches, error, reload };
}

export function useCacheEntries() {
  const {
    cacheEntries,
    totalEntriesCount,
    loadingEntries,
    errorEntries,
    infoEntries,
    limit,
    reloadEntries,
    getByKey,
    setLimit,
  } = useContext(CacheDetailContext);
  return {
    cacheEntries,
    totalEntriesCount,
    loadingEntries,
    errorEntries,
    infoEntries,
    limit,
    reloadEntries,
    getByKey,
    setLimit,
  };
}

export function useCacheDetail() {
  const { cache, loading, error, loadCache, reload, cacheManager } =
    useContext(CacheDetailContext);

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
    onDelete,
  };
}

export function useIgnoreCache(cacheName: string) {
  const { addAlert } = useApiAlert();

  const onIgnore = () => {
    ConsoleServices.caches()
      .ignoreCache(cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onIgnore,
  };
}

export function useUndoIgnoreCache(cacheName: string) {
  const { addAlert } = useApiAlert();

  const onUndoIgnore = () => {
    ConsoleServices.caches()
      .undoIgnoreCache(cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onUndoIgnore,
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
    onSetAvailable,
  };
}

export function useFetchCacheTemplates() {
  const {
    data: cacheTemplates,
    loading,
    error,
  } = useServiceCall<CacheConfig[]>(
    () => ConsoleServices.dataContainer().getCacheConfigurationTemplates(),
    [],
  );

  return { cacheTemplates, loading, error };
}
