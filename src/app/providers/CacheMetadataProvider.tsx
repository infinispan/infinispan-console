import React, { useCallback, useEffect, useReducer } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { isEncodingAvailable } from '@app/utils/encodingUtils';

// --- State & Reducer ---

interface CacheMetadataState {
  cacheName: string;
  cacheManager: CacheManager | undefined;
  cache: DetailedInfinispanCache | undefined;
  loading: boolean;
  error: string;
  /** Incremented on each load/reload to trigger the fetch effect. */
  fetchId: number;
}

type CacheMetadataAction =
  | { type: 'LOAD_CACHE'; name: string }
  | {
      type: 'FETCH_SUCCESS';
      cache: DetailedInfinispanCache;
      cacheManager: CacheManager;
    }
  | { type: 'FETCH_PARTIAL'; cache: DetailedInfinispanCache }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'RELOAD' };

const initialState: CacheMetadataState = {
  cacheName: '',
  cacheManager: undefined,
  cache: undefined,
  loading: false,
  error: '',
  fetchId: 0,
};

function metadataReducer(
  state: CacheMetadataState,
  action: CacheMetadataAction,
): CacheMetadataState {
  switch (action.type) {
    case 'LOAD_CACHE':
      if (!action.name) return state;
      return {
        ...state,
        cacheName: action.name,
        loading: true,
        error: '',
        fetchId: state.fetchId + 1,
      };
    case 'RELOAD':
      return {
        ...state,
        loading: true,
        error: '',
        fetchId: state.fetchId + 1,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        cache: action.cache,
        cacheManager: action.cacheManager,
        loading: false,
        error: '',
      };
    case 'FETCH_PARTIAL':
      return {
        ...state,
        cache: action.cache,
        loading: false,
        error: '',
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.error,
      };
  }
}

// --- Context ---

interface CacheMetadataContextValue {
  cacheName: string;
  cacheManager: CacheManager;
  cache: DetailedInfinispanCache;
  loading: boolean;
  error: string;
  /** Whether entries should be loaded (encoding is available). */
  entriesAvailable: boolean;
  loadCache: (name: string) => void;
  reload: () => void;
}

const defaultValue: CacheMetadataContextValue = {
  cacheName: '',
  cacheManager: undefined as unknown as CacheManager,
  cache: undefined as unknown as DetailedInfinispanCache,
  loading: false,
  error: '',
  entriesAvailable: false,
  loadCache: () => {},
  reload: () => {},
};

export const CacheMetadataContext =
  React.createContext<CacheMetadataContextValue>(defaultValue);

// --- Provider ---

export const CacheMetadataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(metadataReducer, initialState);

  // dispatch is stable — no stale-closure issues, no refs needed
  const loadCache = useCallback(
    (name: string | undefined) => {
      if (name) dispatch({ type: 'LOAD_CACHE', name });
    },
    [dispatch],
  );

  const reload = useCallback(() => dispatch({ type: 'RELOAD' }), [dispatch]);

  // Fetch when fetchId changes (triggered by LOAD_CACHE or RELOAD)
  useEffect(() => {
    if (state.fetchId === 0) return; // no load requested yet

    let cancelled = false;
    const name = state.cacheName;

    const fetchCache = async () => {
      try {
        const maybeCm =
          await ConsoleServices.dataContainer().getDefaultCacheManager();
        if (cancelled) return;

        if (!maybeCm.isRight()) {
          dispatch({ type: 'FETCH_ERROR', error: maybeCm.value.message });
          return;
        }

        const eitherDetail =
          await ConsoleServices.caches().retrieveFullDetail(name);
        if (cancelled) return;

        if (eitherDetail.isRight()) {
          dispatch({
            type: 'FETCH_SUCCESS',
            cache: eitherDetail.value,
            cacheManager: maybeCm.value,
          });
          return;
        }

        // Cache may be unhealthy but existing — try health + config fallback
        const eitherHealth =
          await ConsoleServices.caches().retrieveHealth(name);
        if (cancelled) return;

        if (!eitherHealth.isRight()) {
          dispatch({ type: 'FETCH_ERROR', error: eitherHealth.value.message });
          return;
        }

        const eitherConfig =
          await ConsoleServices.caches().retrieveConfig(name);
        if (cancelled) return;

        if (eitherConfig.isRight()) {
          dispatch({
            type: 'FETCH_PARTIAL',
            cache: {
              name,
              configuration: eitherConfig.value,
              health: eitherHealth.value,
              started: false,
            },
          });
        } else {
          dispatch({
            type: 'FETCH_ERROR',
            error: eitherConfig.value.message,
          });
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: 'FETCH_ERROR', error: 'Unexpected error' });
        }
      }
    };

    fetchCache();

    return () => {
      cancelled = true;
    };
  }, [state.fetchId]);

  const entriesAvailable = state.cache
    ? isEncodingAvailable(state.cache)
    : false;

  const value: CacheMetadataContextValue = {
    cacheName: state.cacheName,
    cacheManager: state.cacheManager as CacheManager,
    cache: state.cache as DetailedInfinispanCache,
    loading: state.loading,
    error: state.error,
    entriesAvailable,
    loadCache,
    reload,
  };

  return (
    <CacheMetadataContext.Provider value={value}>
      {children}
    </CacheMetadataContext.Provider>
  );
};
