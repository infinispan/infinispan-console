import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';

export function useFetchClusterMembers() {
  const [clusterMembers, setClusterMembers] = useState<ClusterMembers>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.cluster()
        .getClusterMembers()
        .then((eitherDefaultCm) => {
          if (eitherDefaultCm.isRight()) {
            setClusterMembers(eitherDefaultCm.value as unknown as ClusterMembers);
          } else {
            const actionResponse = eitherDefaultCm.value as unknown as ActionResponse;
            setError(actionResponse.message);
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
    loading,
    error,
    reload
  };
}

export function useDownloadServerReport() {
  const { addAlert } = useApiAlert();
  const [downloading, setDownloading] = useState(false);
  const [downloadNodeName, setDownloadNodeName] = useState('');

  const downloadServerReport = (nodeName) => {
    setDownloading(true);
    setDownloadNodeName(nodeName);
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
    downloading,
    downloadNodeName
  };
}
