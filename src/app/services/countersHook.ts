import { useEffect, useState } from 'react';
import countersService from '@services/countersService';
import { useApiAlert } from '@app/utils/useApiAlert';

export function fetchCounters() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      countersService
        .getCounters()
        .then((either) => {
          if (either.isRight()) {
            setCounters(either.value);
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
    counters,
    error,
    reload,
  };
}

export function deleteCounter(name: string) {
  const { addAlert } = useApiAlert();

  const onDelete = () => {
    countersService.delete(name).then((actionResponse) => {
      addAlert(actionResponse);
    });
  };
  return {
    onDelete,
  };
}
