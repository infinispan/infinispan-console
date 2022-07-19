import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useFetchProtobufSchemas() {
  const protobufService = ConsoleServices.protobuf();

  const [schemas, setSchemas] = useState<ProtoSchema[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      protobufService
        .getProtobufSchemas()
        .then((eitherResponse) => {
          if (eitherResponse.isRight()) {
            setSchemas(eitherResponse.value);
          } else {
            setError(eitherResponse.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  return { loading, setLoading, error, schemas };
}
