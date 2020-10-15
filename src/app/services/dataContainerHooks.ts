import { useContext } from 'react';
import { DataContainerContext } from '@app/providers/CacheManagerContextProvider';

export function useDataContainer() {
  const { cm, loading, error } = useContext(DataContainerContext);
  return {
    loading,
    error,
    cm,
  };
}

export function useCaches() {
  const { caches, loadingCaches, errorCaches, reloadCaches } = useContext(
    DataContainerContext
  );
  return {
    loadingCaches,
    errorCaches,
    caches,
    reloadCaches,
  };
}
