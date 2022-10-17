import { useState, useEffect } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

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
            setDataDistribution(r.value);
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, dataDistribution };
}

export function useClusterDistribution() {
  const [clusterDistribution, setClusterDistribution] = useState<ClusterDistribution[]>();
  const [errorCluster, setErrorCluster] = useState('');
  const [loadingCluster, setLoadingCluster] = useState(true);

  useEffect(() => {
    if (loadingCluster) {
      ConsoleServices.caches()
        .getClusterDistribution()
        .then((r) => {
          if (r.isRight()) {
            setClusterDistribution(r.value);
          } else {
            setErrorCluster(r.value.message);
          }
        })
        .then(() => setLoadingCluster(false));
    }
  }, [loadingCluster]);

  return { loadingCluster, errorCluster, clusterDistribution };
}
