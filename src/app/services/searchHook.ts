import { useContext, useEffect, useMemo, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useLocalStorage } from '@utils/localStorage';
import { convertToTimeQuantity } from '@utils/convertToTimeQuantity';
import { useApiAlert } from '@utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { UserContext } from '@app/providers/UserContextProvider';
import { QueryContext } from '@app/providers/QueryContextProvider';

export function useSearch(cacheName: string) {
  const [history, setHistory] = useLocalStorage<HistoryMap>('cache-query-history', {});
  const currentHistory = useMemo(() => history[cacheName] || [], [history, cacheName]);
  const { search, storeResult, startSearch, endSearch, clearSearch, onPerPageSelect, onSetPage, onStoreQuery } =
    useContext(QueryContext);

  useEffect(() => {
    if (search.loading && search.query.length > 0) {
      const start: number = Date.now();
      ConsoleServices.search()
        .searchValues(cacheName, search.query, search.perPage, search.page - 1)
        .then((searchResult) => {
          storeResult(searchResult);
          const end: number = Date.now();
          const historyItem = <QueryHistoryItem>{
            query: search.query,
            total: searchResult.total,
            error: searchResult.error,
            cause: searchResult.cause,
            milliseconds: convertToTimeQuantity(end - start),
            type: search.query.includes('<->') ? 'Vector' : 'Search'
          };
          const newHistory = [historyItem, ...currentHistory.filter((i) => i.query !== search.query)].slice(0, 50);
          setHistory({
            ...history,
            [cacheName]: newHistory
          });
        })
        .finally(() => endSearch());
    }
  }, [search]);

  return {
    search,
    startSearch,
    storeResult,
    clearSearch,
    onPerPageSelect,
    onSetPage,
    onStoreQuery
  };
}

export function useDeleteByQuery(cacheName: string, deleteQuery: string, finalAction: () => void) {
  const [history, setHistory] = useLocalStorage<HistoryMap>('cache-query-history', {});
  const currentHistory = useMemo(() => history[cacheName] || [], [history, cacheName]);

  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const [execute, setExecute] = useState(false);

  useEffect(() => {
    if (execute) {
      setExecute(false);
      const start: number = Date.now();
      ConsoleServices.search()
        .deleteByQuery(cacheName, deleteQuery)
        .then((either) => {
          if (either.isRight()) {
            // Add success alert
            addAlert({
              message: t('caches.query.modal-action-entries-success'),
              success: true
            });
          } else {
            addAlert(either.value);
          }
          // Handle History
          const end: number = Date.now();
          const historyItem = <QueryHistoryItem>{
            query: deleteQuery,
            total: either.isRight() ? either.value.hit_count : 0,
            error: either.isLeft(),
            cause: either.isLeft() ? either.value.message : '',
            milliseconds: convertToTimeQuantity(end - start),
            type: 'Delete'
          };
          const newHistory = [historyItem, ...currentHistory.filter((i) => i.query !== deleteQuery)].slice(0, 50);
          setHistory({
            ...history,
            [cacheName]: newHistory
          });
        })
        .finally(finalAction);
    }
  }, [execute]);

  return { setExecute };
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
