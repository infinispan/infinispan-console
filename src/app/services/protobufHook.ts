import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchProtobufSchemas() {
  const [schemas, setSchemas] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const protobufService = ConsoleServices.protobuf();

  useEffect(() => {
    if (loading) {
      protobufService
        .getSchemaList()
        .then((r) => {
          if (r.isRight()) {
            setSchemas(r.value);
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, error, schemas };
}
