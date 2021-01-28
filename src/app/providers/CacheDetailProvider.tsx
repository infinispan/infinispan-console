import React, {useCallback, useEffect, useState} from 'react';
import {ConsoleServices} from "@services/ConsoleServices";
import {useConnectedUser} from "@app/services/userManagementHook";
import {ConsoleACL} from "@services/securityService";

const initialContext = {
  error: '',
  loading: true,
  loadCache: (name: string) => {},
  reload: () => {},
  cache: (undefined as unknown) as DetailedInfinispanCache,
  cacheEntries: [] as CacheEntry[],
  loadingEntries: true,
  errorEntries: '',
  infoEntries: '',
  reloadEntries: () => {},
};

export const CacheDetailContext = React.createContext(initialContext);

const CacheDetailProvider = ({ children }) => {
  const {connectedUser} = useConnectedUser();
  const [cacheName, setCacheName] = useState('');
  const [cache, setCache] = useState<DetailedInfinispanCache>(
    initialContext.cache
  );
  const [error, setError] = useState(initialContext.error);
  const [loading, setLoading] = useState(initialContext.loading);
  const [cacheEntries, setCacheEntries] = useState(initialContext.cacheEntries);
  const [errorEntries, setErrorEntries] = useState(initialContext.errorEntries);
  const [infoEntries, setInfoEntries] = useState(initialContext.infoEntries);
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
        ConsoleServices.caches()
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
      ConsoleServices.caches().retrieveFullDetail(cacheName).then(eitherCache => {
        if(eitherCache.isRight()) {
          setCache(eitherCache.value);
        }
      });
      if(ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.BULK_READ, cacheName, connectedUser)) {
         ConsoleServices.caches()
           .getEntries(cacheName, cache.configuration, '100')
           .then((eitherEntries) => {
             if (eitherEntries.isRight()) {
               setCacheEntries(eitherEntries.value);
             } else {
               setErrorEntries(eitherEntries.value.message);
             }
           })
           .then(() => setLoadingEntries(false));
       } else {
         setLoadingEntries(false);
         setInfoEntries('Connected user lacks BULK_READ permission to browse the cache content.');
      }
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
    infoEntries: infoEntries,
    reloadEntries: useCallback(() => setLoadingEntries(true), []),
  };

  return (
    <CacheDetailContext.Provider value={contextValue}>
      {children}
    </CacheDetailContext.Provider>
  );
};

export { CacheDetailProvider };
