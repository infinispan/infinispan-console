import React from 'react';
import { CacheMetadataProvider } from '@app/providers/CacheMetadataProvider';
import { CacheEntriesProvider } from '@app/providers/CacheEntriesProvider';

/**
 * Composes cache metadata and entries providers.
 * Kept as a single wrapper so existing consumers (routes, DetailCachePage) don't change.
 */
const CacheDetailProvider = ({ children }: { children: React.ReactNode }) => (
  <CacheMetadataProvider>
    <CacheEntriesProvider>{children}</CacheEntriesProvider>
  </CacheMetadataProvider>
);

export { CacheDetailProvider };
