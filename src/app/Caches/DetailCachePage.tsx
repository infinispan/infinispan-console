import * as React from 'react';
import { CacheDetailProvider } from '@app/providers/CacheDetailProvider';
import { DetailCache } from '@app/Caches/DetailCache';
import { useParams } from 'react-router-dom';

const DetailCachePage = () => {
  const cacheName = useParams()['cacheName'] as string;
  return (
    <CacheDetailProvider>
      <DetailCache cacheName={cacheName} />
    </CacheDetailProvider>
  );
};

export { DetailCachePage };
