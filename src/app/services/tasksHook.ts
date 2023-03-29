import { useEffect, useState } from 'react';
import { useApiAlert } from '@app/utils/useApiAlert';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchTask() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      ConsoleServices.tasks()
        .getTasks()
        .then((either) => {
          if (either.isRight()) {
            setTasks(either.value);
          } else {
            setError(either.value.message);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loading]);

  const reload = () => {
    setLoading(true);
  };

  return {
    loading,
    tasks,
    error,
    reload
  };
}

export function useExecuteTask(name: string, params) {
  const { addAlert } = useApiAlert();

  const onExecute = () => {
    ConsoleServices.tasks()
      .executeTask(name, params)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };
  return {
    onExecute
  };
}
