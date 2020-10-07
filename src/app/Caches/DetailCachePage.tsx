import * as React from 'react';
import { CacheDetailProvider } from '@app/providers/CacheDetailProvider';
import { DetailCache } from '@app/Caches/DetailCache';

const DetailCachePage = (props) => {
  const cacheName = decodeURIComponent(props.computedMatch.params.cacheName);
  return (
    <CacheDetailProvider>
      <DetailCache cacheName={cacheName} />
    </CacheDetailProvider>
  );
};

export { DetailCachePage };
