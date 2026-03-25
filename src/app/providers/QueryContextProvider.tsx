import React, { useCallback, useState } from 'react';

const initialContext = {
  search: {
    page: 1,
    perPage: 10,
    searchResult: {
      total: 0,
      values: [],
      error: false,
      cause: '',
      executed: false,
    } as SearchResult,
    loading: false,
    query: '',
  },
  storeResult: (result: SearchResult) => {},
  execute: (query: string) => {},
  startSearch: () => {},
  endSearch: () => {},
  clearSearch: () => {},
  onSetPage: (_event: any, pageNumber: number) => {},
  onPerPageSelect: (_event: any, pageNumber: number) => {},
  onStoreQuery: (query: string) => {},
};

export const QueryContext = React.createContext(initialContext);

const QueryContextProvider = ({ children }) => {
  const [search, setSearch] = useState(initialContext.search);

  const onStoreQuery = useCallback((query: string) => {
    setSearch((prevState) => {
      return { ...prevState, query: query };
    });
  }, []);

  const executeQuery = useCallback((query: string) => {
    setSearch((prevState) => {
      return { ...prevState, query: query, loading: true };
    });
  }, []);

  const onSetPage = useCallback((_event: any, pageNumber: number) => {
    setSearch((prevState) => {
      return { ...prevState, page: pageNumber, loading: true };
    });
  }, []);

  const onPerPageSelect = useCallback((_event: any, perPage: number) => {
    setSearch((prevState) => {
      return { ...prevState, perPage: perPage, loading: true };
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearch((prevState) => {
      return {
        ...prevState,
        query: '',
        searchResult: {
          total: 0,
          values: [],
          error: false,
          cause: '',
          executed: false,
        },
        loading: false,
      };
    });
  }, []);

  const storeResult = useCallback((searchResult: SearchResult) => {
    setSearch((prevState) => {
      return { ...prevState, searchResult: searchResult };
    });
  }, []);

  const startSearch = useCallback(() => {
    setSearch((prevState) => {
      return { ...prevState, loading: true };
    });
  }, []);

  const endSearch = useCallback(() => {
    setSearch((prevState) => {
      return { ...prevState, loading: false };
    });
  }, []);

  const contextValue = {
    search: search,
    execute: executeQuery,
    storeResult: storeResult,
    startSearch: startSearch,
    endSearch: endSearch,
    clearSearch: clearSearch,
    onSetPage: onSetPage,
    onPerPageSelect: onPerPageSelect,
    onStoreQuery: onStoreQuery,
  };
  return (
    <QueryContext.Provider value={contextValue}>
      {children}
    </QueryContext.Provider>
  );
};

export { QueryContextProvider };
