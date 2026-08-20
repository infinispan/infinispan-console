import { useCallback, useEffect, useRef, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';

export function useRollingUpgrade() {
  const [cacheStatuses, setCacheStatuses] = useState<CacheUpgradeStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();

  const initialLoadDone = useRef(false);

  const fetchStatuses = useCallback(async () => {
    if (!initialLoadDone.current) {
      setLoading(true);
    }
    try {
      const cachesEither = await ConsoleServices.dataContainer().getCaches();
      if (!cachesEither.isRight()) {
        setLoading(false);
        return;
      }

      const cacheNames: string[] = (cachesEither.value as CacheInfo[]).map((c) => c.name);

      const statuses: CacheUpgradeStatus[] = await Promise.all(
        cacheNames.map(async (cacheName) => {
          const connected = await ConsoleServices.rollingUpgrade().checkSourceConnection(cacheName);
          return {
            cacheName,
            connected,
            synced: false,
            syncing: false,
            entriesSynced: undefined
          };
        })
      );

      setCacheStatuses((prev) =>
        statuses.map((newStatus) => {
          const existing = prev.find((s) => s.cacheName === newStatus.cacheName);
          return {
            ...newStatus,
            synced: existing?.synced || false,
            syncing: existing?.syncing || false,
            entriesSynced: existing?.entriesSynced
          };
        })
      );
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 10000);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  const syncCache = useCallback(
    async (cacheName: string) => {
      setCacheStatuses((prev) =>
        prev.map((s) =>
          s.cacheName === cacheName ? { ...s, syncing: true, synced: false, entriesSynced: undefined } : s
        )
      );

      const result = await ConsoleServices.rollingUpgrade().syncData(cacheName);
      if (result.isRight()) {
        const count = result.value as number;
        setCacheStatuses((prev) =>
          prev.map((s) =>
            s.cacheName === cacheName ? { ...s, syncing: false, synced: true, entriesSynced: count } : s
          )
        );
        addAlert({
          message: t('rolling-upgrades.status.synced', { count }),
          success: true
        });
      } else {
        setCacheStatuses((prev) => prev.map((s) => (s.cacheName === cacheName ? { ...s, syncing: false } : s)));
        addAlert(result.value as ActionResponse);
      }
    },
    [addAlert, t]
  );

  const disconnectCache = useCallback(
    async (cacheName: string) => {
      const result = await ConsoleServices.rollingUpgrade().deleteSourceConnection(cacheName);
      if (result.success) {
        setCacheStatuses((prev) =>
          prev.map((s) =>
            s.cacheName === cacheName
              ? {
                  ...s,
                  connected: false,
                  synced: false,
                  entriesSynced: undefined
                }
              : s
          )
        );
      }
      addAlert(result);
    },
    [addAlert]
  );

  const syncAll = useCallback(async () => {
    const connectedCaches = cacheStatuses.filter((s) => s.connected && !s.synced);
    for (const cache of connectedCaches) {
      await syncCache(cache.cacheName);
    }
  }, [cacheStatuses, syncCache]);

  const disconnectAll = useCallback(async () => {
    const connectedCaches = cacheStatuses.filter((s) => s.connected);
    for (const cache of connectedCaches) {
      await disconnectCache(cache.cacheName);
    }
  }, [cacheStatuses, disconnectCache]);

  return {
    cacheStatuses,
    loading,
    syncCache,
    disconnectCache,
    syncAll,
    disconnectAll,
    refresh: fetchStatuses
  };
}
