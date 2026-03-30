import { ConsoleServices } from '@services/ConsoleServices';
import { useServiceCall } from '@app/hooks/useServiceCall';

/**
 * Hook for cache data distribution chart
 */
export function useDataDistribution(cacheName: string) {
  const {
    data: dataDistribution,
    loading,
    error,
  } = useServiceCall<DataDistribution[] | undefined>(
    () => ConsoleServices.caches().getDistribution(cacheName),
    undefined,
  );

  return { loading, error, dataDistribution };
}

/**
 * Hook for cluster data distribution chart
 */
export function useClusterDistribution() {
  const {
    data: clusterDistribution,
    loading: loadingCluster,
    error: errorCluster,
  } = useServiceCall<ClusterDistribution[] | undefined>(
    () => ConsoleServices.cluster().getClusterDistribution(),
    undefined,
  );

  return { loadingCluster, errorCluster, clusterDistribution };
}
