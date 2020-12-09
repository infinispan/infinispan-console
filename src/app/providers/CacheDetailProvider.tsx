import React, { useCallback, useEffect, useState } from 'react';
import cacheService from '@services/cacheService';
import utils from '@services/utils';

const initialContext = {
  error: '',
  loading: true,
  loadCache: (name: string) => {},
  reload: () => {},
  cache: (undefined as unknown) as DetailedInfinispanCache,
  cacheEntries: [] as CacheEntry[],
  loadingEntries: true,
  errorEntries: '',
  reloadEntries: () => {},
};

export const CacheDetailContext = React.createContext(initialContext);

const CacheDetailProvider = ({ children }) => {
  const [cacheName, setCacheName] = useState('');
  const [cache, setCache] = useState<DetailedInfinispanCache>(
    initialContext.cache
  );
  const [error, setError] = useState(initialContext.error);
  const [loading, setLoading] = useState(initialContext.loading);
  const [cacheEntries, setCacheEntries] = useState(initialContext.cacheEntries);
  const [errorEntries, setErrorEntries] = useState(initialContext.errorEntries);
  const [loadingEntries, setLoadingEntries] = useState(
    initialContext.loadingEntries
  );

  const loadCache = (name: string | undefined) => {
    if (name != undefined && cacheName != name) {
      setCacheName(name);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [loadingEntries, cache]);

  useEffect(() => {
    fetchCache();
  }, [loading, cacheName]);

  const fetchCache = () => {
    if (loading && cacheName != '') {
      cacheService
        .retrieveFullDetail(cacheName)
        .then((eitherDetail) => {
          if (eitherDetail.isRight()) {
            setCache(eitherDetail.value);
          } else {
            setError(eitherDetail.value.message);
          }
        })
        .then(() => setLoading(false));
    }
  };

  const fetchEntries = () => {
    if (loadingEntries && cache) {
      cacheService
        .getEntries(cacheName, cache.configuration, '100')
        .then((eitherEntries) => {
          if (eitherEntries.isRight()) {
            setCacheEntries(eitherEntries.value);
          } else {
            setError(eitherEntries.value.message);
          }
        })
        .then(() => setLoadingEntries(false));
    }
  };

  const contextValue = {
    loading: loading,
    error: error,
    loadCache: useCallback(loadCache, []),
    reload: useCallback(() => setLoading(true), []),
    cache: cache,
    cacheEntries: cacheEntries,
    loadingEntries: loadingEntries,
    errorEntries: errorEntries,
    reloadEntries: useCallback(() => setLoadingEntries(true), []),
  };

  return (
    <CacheDetailContext.Provider value={contextValue}>
      {children}
    </CacheDetailContext.Provider>
  );
};

export { CacheDetailProvider };
