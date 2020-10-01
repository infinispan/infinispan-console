import { useEffect, useState } from 'react';
import dataContainerService from '@services/dataContainerService';
import cacheService from '@services/cacheService';

export function fetchCaches(cacheManager: string) {
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

export function fetchCache(cacheName: string) {
  const [cache, setCache] = useState<DetailedInfinispanCache>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cacheService
      .retrieveFullDetail(cacheName)
      .then((eitherDetail) => {
        if (eitherDetail.isRight()) {
          setCache(eitherDetail.value);
        } else {
          setError(eitherDetail.value.message);
        }
      })
      .then(() => setLoading(false));
  }, [cacheName]);

  return {
    loading,
    cache,
    error,
  };
}
