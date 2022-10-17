import { useContext, useEffect, useState } from 'react';
import { CacheDetailContext } from '@app/providers/CacheDetailProvider';
import { ConsoleServices } from '@services/ConsoleServices';

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
  const { cacheEntries, loadingEntries, errorEntries, infoEntries, reloadEntries, getByKey } =
    useContext(CacheDetailContext);
  return {
    cacheEntries,
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
