import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';

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
        .finally(() => setLoading(false));
    }
  }, [loading]);

  const reload = () => {
    if (!loading) setLoading(true);
  };

  return { loading, reload, error, schemas };
}

export function useEditProtobufSchema(schemaName: string, schemaContent: string) {
  const { addAlert } = useApiAlert();

  const onEditSchema = () => {
    ConsoleServices.protobuf()
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
    ConsoleServices.protobuf()
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
            setError('An error occurred. Try closing the tab and opening it again.');
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading, schemaName]);

  return { schemaContent, loading, error, setLoading };
}
