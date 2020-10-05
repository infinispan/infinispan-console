import { useEffect, useState } from 'react';
import dataContainerService from '@services/dataContainerService';

export function useFetchGlobalStats() {
  const [stats, setStats] = useState<CacheManagerStats>({
    statistics_enabled: false,
    hits: -1,
    retrievals: -1,
    remove_misses: -1,
    remove_hits: -1,
    evictions: -1,
    stores: -1,
    misses: -1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      dataContainerService
        .getDefaultCacheManager()
        .then((eitherDefaultCm) => {
          if (eitherDefaultCm.isRight()) {
            dataContainerService
              .getCacheManagerStats(eitherDefaultCm.value.name)
              .then((detailedStats) => {
                setStats(detailedStats);
                setLoading(false);
              });
          } else {
            setError(eitherDefaultCm.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return {
    loading,
    stats,
    error,
  };
}
