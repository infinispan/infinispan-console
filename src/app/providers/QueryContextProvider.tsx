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
      executed: false
    } as SearchResult,
    loading: false,
    query: ''
  },
  storeResult: (result: SearchResult) => {},
  execute: (query: string) => {},
  startSearch: () => {},
  endSearch: () => {},
  clearSearch: () => {},
  onSetPage: (_event: any, pageNumber: number) => {},
  onPerPageSelect: (_event: any, pageNumber: number) => {},
  onStoreQuery: (query: string) => {}
};

export const QueryContext = React.createContext(initialContext);

const QueryContextProvider = ({ children }) => {
  const [search, setSearch] = useState(initialContext.search);

  const onStoreQuery = (query: string) => {
    setSearch((prevState) => {
      return { ...prevState, query: query };
    });
  };

  const executeQuery = (query: string) => {
    setSearch((prevState) => {
      return { ...prevState, query: query, loading: true };
    });
  };

  const onSetPage = (_event: any, pageNumber: number) => {
    setSearch((prevState) => {
      return { ...prevState, page: pageNumber, loading: true };
    });
  };

  const onPerPageSelect = (_event: any, perPage: number) => {
    setSearch((prevState) => {
      return { ...prevState, perPage: perPage, loading: true };
    });
  };

  const clearSearch = () => {
    setSearch((prevState) => {
      return {
        ...prevState,
        query: '',
        searchResult: {
          total: 0,
          values: [],
          error: false,
          cause: '',
          executed: false
        },
        loading: false
      };
    });
  };

  const storeResult = (searchResult: SearchResult) => {
    setSearch((prevState) => {
      return { ...prevState, searchResult: searchResult };
    });
  };

  const startSearch = () => {
    setSearch((prevState) => {
      return { ...prevState, loading: true };
    });
  };

  const endSearch = () => {
    setSearch((prevState) => {
      return { ...prevState, loading: false };
    });
  };

  const contextValue = {
    search: search,
    execute: useCallback(executeQuery, []),
    storeResult: useCallback(storeResult, []),
    startSearch: useCallback(startSearch, []),
    endSearch: useCallback(endSearch, []),
    clearSearch: useCallback(clearSearch, []),
    onSetPage: useCallback(onSetPage, []),
    onPerPageSelect: useCallback(onPerPageSelect, []),
    onStoreQuery: useCallback(onStoreQuery, [])
  };
  return <QueryContext.Provider value={contextValue}>{children}</QueryContext.Provider>;
};

export { QueryContextProvider };
