import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useFetchProtobufSchemas() {
  const {
    data: schemas,
    loading,
    reload,
    error,
  } = useServiceCall<ProtoSchema[]>(
    () => ConsoleServices.protobuf().getProtobufSchemas(),
    [],
  );

  return { loading, reload, error, schemas };
}

export function useEditProtobufSchema(
  schemaName: string,
  schemaContent: string,
) {
  const { addAlert } = useApiAlert();

  const onEditSchema = () => {
    return ConsoleServices.protobuf()
      .createOrUpdateSchema(schemaName, schemaContent, false)
      .then((eitherCreate) => {
        addAlert(eitherCreate);
      });
  };

  return { onEditSchema };
}

export function useDeleteProtobufSchema(schemaName: string) {
  const { addAlert } = useApiAlert();

  const onDeleteSchema = () => {
    return ConsoleServices.protobuf()
      .delete(schemaName)
      .then((actionResponse) => {
        addAlert(actionResponse);
      });
  };

  return { onDeleteSchema };
}

export function useFetchProtobufSchemaContent(schemaName: string) {
  const [schemaContent, setSchemasContent] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading && schemaName) {
      ConsoleServices.protobuf()
        .getSchema(schemaName)
        .then((eitherResponse) => {
          if (eitherResponse.isRight()) {
            setSchemasContent(eitherResponse.value);
          } else {
            setError(
              'An error occurred. Try closing the tab and opening it again.',
            );
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading, schemaName]);

  return { schemaContent, loading, error, setLoading };
}
