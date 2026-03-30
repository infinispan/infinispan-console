import { useEffect, useState } from 'react';
import { Either } from '@services/either';

interface UseServiceCallOptions<T> {
  transform?: (value: T) => T;
}

/**
 * Generic hook for data-fetching service calls that return Either<ActionResponse, T>.
 * Manages loading, error, and data state with automatic Either unwrapping.
 */
export function useServiceCall<T>(
  serviceFn: () => Promise<Either<ActionResponse, T>>,
  initialValue: T,
  options?: UseServiceCallOptions<T>,
) {
  const [data, setData] = useState<T>(initialValue);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      serviceFn()
        .then((either) => {
          if (either.isRight()) {
            const value = options?.transform
              ? options.transform(either.value)
              : either.value;
            setData(value);
          } else {
            setError(either.value.message);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [loading]);

  const reload = () => {
    if (!loading) setLoading(true);
  };

  return { data, error, loading, setLoading, reload };
}
