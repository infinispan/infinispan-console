import { useContext, useEffect, useReducer, useState } from 'react';
import dataContainerService from '@services/dataContainerService';
import cacheService from '@services/cacheService';
import { APIAlertContext } from '@app/providers/APIAlertProvider';
import { CacheDetailContext } from '@app/providers/CacheDetailProvider';

export function useFetchCaches(cacheManager: string) {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      dataContainerService
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
    reload,
  };
}

export function useReloadCache() {
  const { reload } = useContext(CacheDetailContext);

  return { reload };
}

export function useFetchCache(cacheName: string) {
  const { cache, loading, error, loadCache, reload } = useContext(
    CacheDetailContext
  );

  useEffect(() => {
    loadCache(cacheName);
  }, []);

  return { cache, loading, error, loadCache, reload };
}
