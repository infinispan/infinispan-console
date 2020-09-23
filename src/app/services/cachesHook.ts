import { useEffect, useState } from 'react';
import dataContainerService from '@services/dataContainerService';

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
