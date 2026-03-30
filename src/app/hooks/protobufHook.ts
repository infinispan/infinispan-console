import { ConsoleServices } from '@services/ConsoleServices';
import { useServiceCall } from '@app/hooks/useServiceCall';

export function useFetchProtobufTypes() {
  const {
    data: protobufTypes,
    loading,
    error,
  } = useServiceCall<string[]>(
    () => ConsoleServices.protobuf().getProtobufTypes(),
    [],
  );

  return { loading, error, protobufTypes };
}
