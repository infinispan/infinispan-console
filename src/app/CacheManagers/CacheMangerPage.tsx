import * as React from 'react';
import { ContainerDataProvider } from '@app/providers/CacheManagerContextProvider';
import { CacheManagers } from '@app/CacheManagers/CacheManagers';

const CacheManagerPage = () => {
  return (
    <ContainerDataProvider>
      <CacheManagers />
    </ContainerDataProvider>
  );
};

export { CacheManagerPage };
