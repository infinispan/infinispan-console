import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/hooks/userManagementHook';
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
  setLimit: (limit: string) => {},
};

export const CacheDetailContext = React.createContext(initialContext);

const CacheDetailProvider = ({ children }) => {
  const { connectedUser } = useConnectedUser();
  const [cacheName, setCacheName] = useState('');
  const [cacheManager, setCacheManager] = useState<CacheManager>(
    initialContext.cacheManager,
  );
  const [cache, setCache] = useState<DetailedInfinispanCache>(
    initialContext.cache,
  );
  const [error, setError] = useState(initialContext.error);
  const [loading, setLoading] = useState(initialContext.loading);
  const [cacheEntries, setCacheEntries] = useState(initialContext.cacheEntries);
  const [totalEntriesCount, setTotalEntriesCount] = useState<number>(
    initialContext.totalEntriesCount,
  );
  const [errorEntries, setErrorEntries] = useState(initialContext.errorEntries);
  const [infoEntries, setInfoEntries] = useState(initialContext.infoEntries);
  const [loadingEntries, setLoadingEntries] = useState(
    initialContext.loadingEntries,
  );
  const [limit, setLimit] = useState(initialContext.limit);

  // Refs to hold current values for use inside async callbacks
  const cacheNameRef = useRef(cacheName);
  cacheNameRef.current = cacheName;

  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  const loadCache = useCallback((name: string | undefined) => {
    if (name != undefined && name != '') {
      setCacheName((prev) => {
        if (prev !== name) {
          return name;
        }
        return prev;
      });
      setLoading(true);
    }
  }, []);

  // Fetch cache detail when loading is triggered
  useEffect(() => {
    if (!loading) return;

    let cancelled = false;

    const doFetchCache = async () => {
      const name = cacheNameRef.current;

      try {
        const maybeCm =
          await ConsoleServices.dataContainer().getDefaultCacheManager();
        if (cancelled) return;

        if (!maybeCm.isRight()) {
          setError(maybeCm.value.message);
          setLoading(false);
          return;
        }

        setCacheManager(maybeCm.value);

        const eitherDetail =
          await ConsoleServices.caches().retrieveFullDetail(name);
        if (cancelled) return;

        if (eitherDetail.isRight()) {
          setCache(eitherDetail.value);
          setLoadingEntries(isEncodingAvailable(eitherDetail.value));
          setLoading(false);
          return;
        }

        // Cache can be unhealthy but existing — try health + config fallback
        const eitherHealth =
          await ConsoleServices.caches().retrieveHealth(name);
        if (cancelled) return;

        if (!eitherHealth.isRight()) {
          setError(eitherHealth.value.message);
          setLoading(false);
          return;
        }

        const eitherConfig =
          await ConsoleServices.caches().retrieveConfig(name);
        if (cancelled) return;

        if (eitherConfig.isRight()) {
          const detail: DetailedInfinispanCache = {
            name: name,
            configuration: eitherConfig.value,
            health: eitherHealth.value,
            started: false,
          };
          setCache(detail);
        } else {
          setError(eitherConfig.value.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    doFetchCache();

    return () => {
      cancelled = true;
    };
  }, [loading]);

  // Fetch entries when limit changes or entries reload is triggered
  useEffect(() => {
    setLoadingEntries(true);
  }, [limit]);

  useEffect(() => {
    if (!loadingEntries) return;

    const currentCache = cacheRef.current;
    const currentCacheName = cacheNameRef.current;

    if (
      !ConsoleServices.security().hasCacheConsoleACL(
        ConsoleACL.BULK_READ,
        currentCacheName,
        connectedUser,
      )
    ) {
      setLoadingEntries(false);
      setInfoEntries('caches.entries.read-error');
      return;
    }

    if (!currentCache) {
      setLoadingEntries(false);
      return;
    }

    ConsoleServices.caches()
      .getEntries(currentCacheName, currentCache.encoding!, limit)
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
  }, [loadingEntries, connectedUser, limit]);

  const fetchEntry = (keyToSearch: string, kct: ContentType) => {
    const currentCache = cacheRef.current;
    const currentCacheName = cacheNameRef.current;

    ConsoleServices.caches()
      .getEntry(currentCacheName, currentCache.encoding!, keyToSearch, kct)
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

  const reload = useCallback(() => setLoading(true), []);
  const reloadEntries = useCallback(() => setLoadingEntries(true), []);

  const contextValue = {
    loading: loading,
    error: error,
    loadCache: loadCache,
    reload: reload,
    cache: cache,
    cacheManager: cacheManager,
    cacheEntries: cacheEntries,
    totalEntriesCount: totalEntriesCount,
    loadingEntries: loadingEntries,
    errorEntries: errorEntries,
    infoEntries: infoEntries,
    limit: limit,
    reloadEntries: reloadEntries,
    getByKey: fetchEntry,
    setLimit: setLimit,
  };
  return (
    <CacheDetailContext.Provider value={contextValue}>
      {children}
    </CacheDetailContext.Provider>
  );
};

export { CacheDetailProvider };
