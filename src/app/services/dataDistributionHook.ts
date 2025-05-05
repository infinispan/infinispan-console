import { useState, useEffect } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Hook for cache data distribution chart
 */
export function useDataDistribution(cacheName: string) {
  const [dataDistribution, setDataDistribution] = useState<DataDistribution[]>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.caches()
        .getDistribution(cacheName)
        .then((r) => {
          if (r.isRight()) {
            setDataDistribution(r.value as DataDistribution[]);
          } else {
            const actionResponse = r.value as ActionResponse;
            setError(actionResponse.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, dataDistribution };
}

/**
 * Hook for cluster data distribution chart
 */
export function useClusterDistribution() {
  const [clusterDistribution, setClusterDistribution] = useState<ClusterDistribution[]>();
  const [errorCluster, setErrorCluster] = useState('');
  const [loadingCluster, setLoadingCluster] = useState(true);

  useEffect(() => {
    if (loadingCluster) {
      ConsoleServices.cluster()
        .getClusterDistribution()
        .then((r) => {
          if (r.isRight()) {
            setClusterDistribution(r.value as ClusterDistribution[]);
          } else {
            const actionResponse = r.value as ActionResponse;
            setErrorCluster(actionResponse.message);
          }
        })
        .then(() => setLoadingCluster(false));
    }
  }, [loadingCluster]);

  return { loadingCluster, errorCluster, clusterDistribution };
}
