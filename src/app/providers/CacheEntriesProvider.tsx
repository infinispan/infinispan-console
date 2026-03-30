import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/hooks/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { ContentType } from '@services/infinispanRefData';
import { CacheMetadataContext } from '@app/providers/CacheMetadataProvider';

// --- State & Reducer ---

interface CacheEntriesState {
  entries: CacheEntry[];
  totalCount: number;
  loading: boolean;
  error: string;
  info: string;
}

type CacheEntriesAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; entries: CacheEntry[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'FETCH_INFO'; info: string }
  | { type: 'NO_PERMISSION'; info: string }
  | { type: 'RESET' };

const initialState: CacheEntriesState = {
  entries: [],
  totalCount: 0,
  loading: false,
  error: '',
  info: '',
};

function entriesReducer(
  state: CacheEntriesState,
  action: CacheEntriesAction,
): CacheEntriesState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '', info: '' };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        entries: action.entries,
        totalCount: action.entries.length,
        loading: false,
        error: '',
        info: '',
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'FETCH_INFO':
      return { ...state, loading: false, info: action.info };
    case 'NO_PERMISSION':
      return { ...state, loading: false, info: action.info };
    case 'RESET':
      return initialState;
  }
}

// --- Context ---

interface CacheEntriesContextValue {
  cacheEntries: CacheEntry[];
  totalEntriesCount: number;
  loadingEntries: boolean;
  errorEntries: string;
  infoEntries: string;
  limit: string;
  reloadEntries: () => void;
  getByKey: (keyToSearch: string, kct: ContentType) => void;
  setLimit: (limit: string) => void;
}

const defaultValue: CacheEntriesContextValue = {
  cacheEntries: [],
  totalEntriesCount: 0,
  loadingEntries: false,
  errorEntries: '',
  infoEntries: '',
  limit: '100',
  reloadEntries: () => {},
  getByKey: () => {},
  setLimit: () => {},
};

export const CacheEntriesContext =
  React.createContext<CacheEntriesContextValue>(defaultValue);

// --- Provider ---

export const CacheEntriesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { connectedUser } = useConnectedUser();
  const { cache, cacheName, entriesAvailable } =
    useContext(CacheMetadataContext);

  const [state, dispatch] = useReducer(entriesReducer, initialState);
  const [limit, setLimit] = useState('100');

  // Reload trigger — incrementing this re-runs the fetch effect
  const [reloadKey, setReloadKey] = useState(0);
  const reloadEntries = useCallback(() => setReloadKey((k) => k + 1), []);

  // Fetch entries when cache becomes available, limit changes, or reload is triggered.
  // No boolean-flag chain — these are direct dependencies.
  useEffect(() => {
    if (!entriesAvailable || !cache) {
      dispatch({ type: 'RESET' });
      return;
    }

    if (
      !ConsoleServices.security().hasCacheConsoleACL(
        ConsoleACL.BULK_READ,
        cacheName,
        connectedUser,
      )
    ) {
      dispatch({ type: 'NO_PERMISSION', info: 'caches.entries.read-error' });
      return;
    }

    dispatch({ type: 'FETCH_START' });

    let cancelled = false;

    ConsoleServices.caches()
      .getEntries(cacheName, cache.encoding!, limit)
      .then((eitherEntries) => {
        if (cancelled) return;

        if (eitherEntries.isRight()) {
          dispatch({ type: 'FETCH_SUCCESS', entries: eitherEntries.value });
        } else if (eitherEntries.value.success) {
          dispatch({ type: 'FETCH_INFO', info: eitherEntries.value.message });
        } else {
          dispatch({
            type: 'FETCH_ERROR',
            error: eitherEntries.value.message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entriesAvailable, cache, cacheName, connectedUser, limit, reloadKey]);

  const getByKey = useCallback(
    (keyToSearch: string, kct: ContentType) => {
      if (!cache) return;

      ConsoleServices.caches()
        .getEntry(cacheName, cache.encoding!, keyToSearch, kct)
        .then((response) => {
          if (response.isRight()) {
            dispatch({ type: 'FETCH_SUCCESS', entries: response.value });
          } else {
            dispatch({
              type: 'FETCH_ERROR',
              error: response.value.message,
            });
          }
        });
    },
    [cache, cacheName],
  );

  const value: CacheEntriesContextValue = {
    cacheEntries: state.entries,
    totalEntriesCount: state.totalCount,
    loadingEntries: state.loading,
    errorEntries: state.error,
    infoEntries: state.info,
    limit,
    reloadEntries,
    getByKey,
    setLimit,
  };

  return (
    <CacheEntriesContext.Provider value={value}>
      {children}
    </CacheEntriesContext.Provider>
  );
};
