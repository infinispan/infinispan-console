import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';

export function useFetchClusterMembers() {
  const [cacheManager, setCacheManager] = useState<CacheManager>();
  const [clusterMembers, setClusterMembers] = useState<ClusterMember[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.dataContainer()
        .getDefaultCacheManager()
        .then((eitherDefaultCm) => {
          if (eitherDefaultCm.isRight()) {
            setCacheManager(eitherDefaultCm.value);
            setClusterMembers(eitherDefaultCm.value.cluster_members);
          } else {
            setError(eitherDefaultCm.value.message);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loading]);

  const reload = () => {
    setLoading(true);
  };

  return {
    clusterMembers,
    cacheManager,
    loading,
    error,
    reload
  };
}

export function useDownloadServerReport() {
  const { addAlert } = useApiAlert();
  const [downloading, setDownloading] = useState(false);

  const downloadServerReport = (nodeName) => {
    setDownloading(true);
    ConsoleServices.server()
      .downloadReport(nodeName)
      .then((response) => {
        if (response.isRight()) {
          const blob = new Blob([response.value], { type: 'application/gzip' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', nodeName + '-report.tar.gz');
          document.body.appendChild(link);
          link.click();
        } else {
          addAlert(response.value);
        }
      })
      .finally(() => setDownloading(false));
  };
  return {
    downloadServerReport,
    downloading
  };
}
