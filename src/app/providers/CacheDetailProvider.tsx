import React, { useCallback, useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { ContentType } from '@services/infinispanRefData';
import { isEncodingAvailable } from '@app/utils/encodingUtils';

const initialContext = {
  error: '',
  loading: false,
  cacheManager: undefined as unknown as CacheManager,
  cache: undefined as unknown as DetailedInfinispanCache,
  loadCache: (name: string) => {},
  reload: () => {},
  getByKey: (keyToSearch: string, kct: ContentType) => {},
  cacheEntries: [] as CacheEntry[],
  totalEntriesCount: 0,
  loadingEntries: false,
  errorEntries: '',
  infoEntries: '',
  limit: '100',
  reloadEntries: () => {},
  setLimit: (limit: string) => {}
};

export const CacheDetailContext = React.createContext(initialContext);

const CacheDetailProvider = ({ children }) => {
  const { connectedUser } = useConnectedUser();
  const [cacheName, setCacheName] = useState('');
  const [cacheManager, setCacheManager] = useState<CacheManager>(initialContext.cacheManager);
  const [cache, setCache] = useState<DetailedInfinispanCache>(initialContext.cache);
  const [error, setError] = useState(initialContext.error);
  const [loading, setLoading] = useState(initialContext.loading);
  const [cacheEntries, setCacheEntries] = useState(initialContext.cacheEntries);
  const [totalEntriesCount, setTotalEntriesCount] = useState<number>(initialContext.totalEntriesCount);
  const [errorEntries, setErrorEntries] = useState(initialContext.errorEntries);
  const [infoEntries, setInfoEntries] = useState(initialContext.infoEntries);
  const [loadingEntries, setLoadingEntries] = useState(initialContext.loadingEntries);
  const [limit, setLimit] = useState(initialContext.limit);
  const loadCache = (name: string | undefined) => {
    if (name != undefined && name != '' && cacheName != name) {
      setCacheName(name);
      setLoading(true);
    }
  };

  useEffect(() => {
    setLoadingEntries(true);
  }, [limit]);

  useEffect(() => {
    fetchEntries();
  }, [loadingEntries]);

  useEffect(() => {
    fetchCache();
  }, [loading]);

  const fetchCache = () => {
    if (loading) {
      ConsoleServices.dataContainer()
        .getDefaultCacheManager()
        .then((maybeCm) => {
          if (maybeCm.isRight()) {
            setCacheManager(maybeCm.value);
            ConsoleServices.caches()
              .retrieveFullDetail(cacheName)
              .then((eitherDetail) => {
                if (eitherDetail.isRight()) {
                  setCache(eitherDetail.value);
                } else {
                  setError(eitherDetail.value.message);
                }
              })
              .finally(() => {
                setLoading(false);
                isEncodingAvailable(cache) && setLoadingEntries(true);
              });
          } else {
            setError(maybeCm.value.message);
          }
        });
    }
  };

  const fetchEntry = (keyToSearch: string, kct: ContentType) => {
    ConsoleServices.caches()
      .getEntry(cacheName, cache.encoding, keyToSearch, kct)
      .then((response) => {
        let entries: CacheEntry[] = [];
        if (response.isRight()) {
          entries = response.value;
        } else {
          setErrorEntries(response.value.message);
        }
        setCacheEntries(entries);
      });
  };

  const fetchEntries = () => {
    if (loadingEntries) {
      if (ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.BULK_READ, cacheName, connectedUser)) {
        if (cache) {
          ConsoleServices.caches()
            .getEntries(cacheName, cache.encoding, limit)
            .then((eitherEntries) => {
              if (eitherEntries.isRight()) {
                setCacheEntries(eitherEntries.value);
                setTotalEntriesCount(eitherEntries.value.length);
                setErrorEntries('');
                setInfoEntries('');
              } else {
                if (eitherEntries.value.success) {
                  setInfoEntries(eitherEntries.value.message);
                } else {
                  setErrorEntries(eitherEntries.value.message);
                }
              }
            })
            .finally(() => setLoadingEntries(false));
        } else {
          setLoadingEntries(false);
        }
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
    cacheManager: cacheManager,
    cacheEntries: cacheEntries,
    totalEntriesCount: totalEntriesCount,
    loadingEntries: loadingEntries,
    errorEntries: errorEntries,
    infoEntries: infoEntries,
    limit: limit,
    reloadEntries: useCallback(() => setLoadingEntries(true), []),
    getByKey: fetchEntry,
    setLimit: setLimit
  };
  return <CacheDetailContext.Provider value={contextValue}>{children}</CacheDetailContext.Provider>;
};

export { CacheDetailProvider };
