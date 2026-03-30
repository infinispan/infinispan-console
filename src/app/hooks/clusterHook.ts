import { useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useServiceCall } from '@app/hooks/useServiceCall';
import { Either } from '@services/either';

export function useFetchClusterMembers() {
  const {
    data: clusterMembers,
    loading,
    error,
    reload,
  } = useServiceCall<ClusterMembers | undefined>(
    () =>
      ConsoleServices.cluster().getClusterMembers() as unknown as Promise<
        Either<ActionResponse, ClusterMembers | undefined>
      >,
    undefined,
  );

  return { clusterMembers, loading, error, reload };
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
    downloadNodeName,
  };
}
