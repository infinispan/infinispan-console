import React, { useCallback, useEffect, useState } from 'react';
import cacheService from '@services/cacheService';

const initialContext = {
  error: '',
  loading: true,
  loadCache: (name: string) => {},
  reload: () => {},
  cache: (undefined as unknown) as DetailedInfinispanCache,
};

export const CacheDetailContext = React.createContext(initialContext);

const CacheDetailProvider = ({ children }) => {
  const [cacheName, setCacheName] = useState('');
  const [cache, setCache] = useState<DetailedInfinispanCache>(
    initialContext.cache
  );
  const [error, setError] = useState(initialContext.error);
  const [loading, setLoading] = useState(initialContext.loading);

  const reload = () => {
    setLoading(true);
  };

  const loadCache = (name: string | undefined) => {
    if (name != undefined && cacheName != name) {
      setCacheName(name);
    }
  };

  useEffect(() => {
    if (loading && cacheName != '') {
      fetchCache();
    }
  }, [loading]);

  useEffect(() => {
    fetchCache();
  }, [cacheName]);

  const fetchCache = () => {
    if (cacheName != '') {
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

  const contextValue = {
    loading: loading,
    error: error,
    loadCache: useCallback(loadCache, []),
    reload: useCallback(reload, []),
    cache: cache,
  };

  return (
    <CacheDetailContext.Provider value={contextValue}>
      {children}
    </CacheDetailContext.Provider>
  );
};

export { CacheDetailProvider };
