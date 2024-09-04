import { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';

export function useSearch(cacheName: string) {
  const [search, setSearch] = useState({
    page: 1,
    perPage: 10,
    searchResult: <SearchResult>{
      total: 0,
      values: [],
      error: false,
      cause: '',
      executed: false
    },
    loading: false,
    query: ''
  });

  useEffect(() => {
    if (search.loading && search.query.length > 0) {
      ConsoleServices.search()
        .searchValues(cacheName, search.query, search.perPage, search.page - 1)
        .then((searchResult) => {
          setSearch((prevState) => {
            return { ...prevState, searchResult: searchResult };
          });
        })
        .then(() =>
          setSearch((prevState) => {
            return { ...prevState, loading: false };
          })
        );
    }
  }, [search]);

  return { search, setSearch };
}

export function useIndexMetamodel(cacheName: string) {
  const [indexMetamodel, setIndexMetamodel] = useState<Map<string, IndexMetamodel>>(new Map());
  const [errorIndexMetamodel, setErrorMetamodel] = useState('');
  const [loadingIndexMetamodel, setLoadingIndexMetamodel] = useState(true);

  useEffect(() => {
    if (loadingIndexMetamodel) {
      ConsoleServices.search()
        .retrieveIndexMetamodel(cacheName)
        .then((eitherMetamodel) => {
          if (eitherMetamodel.isRight()) {
            setIndexMetamodel(eitherMetamodel.value);
          } else {
            setErrorMetamodel(eitherMetamodel.value.message);
          }
        })
        .then(() => setLoadingIndexMetamodel(false));
    }
  }, [loadingIndexMetamodel]);

  return {
    loadingIndexMetamodel,
    errorIndexMetamodel,
    indexMetamodel
  };
}
