import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchProtobufTypes() {
  const [protobufTypes, setProtobufTypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const protobufService = ConsoleServices.protobuf();

  useEffect(() => {
    if (loading) {
      protobufService
        .getProtobufTypes()
        .then((r) => {
          if (r.isRight()) {
            setProtobufTypes(r.value);
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, protobufTypes };
}
