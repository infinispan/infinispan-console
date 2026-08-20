import { useContext } from 'react';
import { CreateCacheContext } from '@app/providers/CreateCacheProvider';

export function useCreateCache() {
  const { configuration, setConfiguration, addFeature, removeFeature } = useContext(CreateCacheContext);
  return {
    configuration,
    setConfiguration,
    addFeature,
    removeFeature
  };
}
