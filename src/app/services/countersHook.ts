import { useEffect, useState } from 'react';
import { useApiAlert } from '@app/utils/useApiAlert';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchCounters() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.counters()
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
    reload
  };
}

export function useDeleteCounter(name: string) {
  const { addAlert } = useApiAlert();

  const onDelete = () => {
    ConsoleServices.counters()
      .delete(name)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onDelete
  };
}

export function useAddDeltaCounter(name: string, deltaValue: number) {
  const { addAlert } = useApiAlert();

  const onAddDelta = () => {
    ConsoleServices.counters()
      .setDelta(name, deltaValue)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onAddDelta
  };
}

export function useResetCounter(name: string) {
  const { addAlert } = useApiAlert();

  const onResetCounter = () => {
    ConsoleServices.counters()
      .resetCounter(name)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onResetCounter
  };
}

export function useCreateCounter(counterName: string, counterConfig) {
  const { addAlert } = useApiAlert();

  const onCreateCounter = () => {
    ConsoleServices.counters()
      .createCounter(counterName, counterConfig)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onCreateCounter
  };
}
