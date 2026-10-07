import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  Label,
  PageSection,
  Pagination,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { onSearch } from '@app/utils/searchFilter';
import { RollingUpgradeConfirmationModal } from './RollingUpgradeConfirmationModals';

const RollingUpgradeStatus = (props: {
  cacheStatuses: CacheUpgradeStatus[];
  syncCache: (name: string) => void;
  disconnectCache: (name: string) => void;
  syncAll: () => void;
  disconnectAll: () => void;
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [modalType, setModalType] = useState<'sync-all' | 'disconnect-all' | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  const [rows, setRows] = useState<CacheUpgradeStatus[]>([]);

  const connectedCaches = props.cacheStatuses.filter((s) => s.connected);

  const filteredCaches = connectedCaches.filter((s) => onSearch(searchValue, s.cacheName));

  useEffect(() => {
    const initSlice = (pagination.page - 1) * pagination.perPage;
    setRows(filteredCaches.slice(initSlice, initSlice + pagination.perPage));
  }, [pagination, searchValue, props.cacheStatuses]);

  const onSetPage = (_event, pageNumber) => {
    setPagination({ ...pagination, page: pageNumber });
  };

  const onPerPageSelect = (_event, perPage) => {
    setPagination({ page: 1, perPage });
  };

  const renderSyncStatus = (status: CacheUpgradeStatus) => {
    if (status.syncing) {
      return <Label color="orange">{t('rolling-upgrades.status.syncing')}</Label>;
    }
    if (status.synced && status.entriesSynced !== undefined) {
      return <Label color="blue">{t('rolling-upgrades.status.synced', { count: status.entriesSynced })}</Label>;
    }
    return t('rolling-upgrades.status.not-synced');
  };

  const renderActions = (status: CacheUpgradeStatus) => {
    return (
      <>
        {!status.synced && (
          <Button variant={ButtonVariant.secondary} size="sm" onClick={() => props.syncCache(status.cacheName)}>
            {t('rolling-upgrades.actions.sync')}
          </Button>
        )}{' '}
        <Button variant={ButtonVariant.link} size="sm" onClick={() => props.disconnectCache(status.cacheName)}>
          {t('rolling-upgrades.actions.disconnect')}
        </Button>
      </>
    );
  };

  const toolbarPagination = (dropDirection) => (
    <Pagination
      itemCount={filteredCaches.length}
      perPage={pagination.perPage}
      page={pagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-rolling-upgrades"
      onPerPageSelect={onPerPageSelect}
      isCompact
      dropDirection={dropDirection}
    />
  );

  return (
    <>
      <PageSection>
        <Content>
          <h1>{t('rolling-upgrades.title')}</h1>
        </Content>
        <Content component="p">
          <Label color="orange">{t('rolling-upgrades.status.in-progress')}</Label>
        </Content>
        <Toolbar id="rolling-upgrade-toolbar">
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder={t('rolling-upgrades.status.search-placeholder')}
                value={searchValue}
                onChange={(_event, val) => setSearchValue(val)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => setModalType('sync-all')}
                isDisabled={connectedCaches.length === 0}
              >
                {t('rolling-upgrades.actions.sync-all')}
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.danger}
                onClick={() => setModalType('disconnect-all')}
                isDisabled={connectedCaches.length === 0}
              >
                {t('rolling-upgrades.actions.disconnect-all')}
              </Button>
            </ToolbarItem>
            <ToolbarItem variant={ToolbarItemVariant.pagination}>{toolbarPagination('down')}</ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label={t('rolling-upgrades.title')} variant="compact">
          <Thead>
            <Tr>
              <Th>{t('rolling-upgrades.status.cache-name')}</Th>
              <Th>{t('rolling-upgrades.status.sync-status')}</Th>
              <Th>{t('rolling-upgrades.status.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((status) => (
              <Tr key={status.cacheName}>
                <Td>
                  <Link
                    to={{
                      pathname: '/cache/' + encodeURIComponent(status.cacheName),
                      search: location.search
                    }}
                  >
                    <Button variant={ButtonVariant.link} style={{ paddingLeft: 0 }}>
                      {status.cacheName}
                    </Button>
                  </Link>
                </Td>
                <Td>{renderSyncStatus(status)}</Td>
                <Td>{renderActions(status)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Toolbar id="rolling-upgrade-toolbar-bottom">
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{toolbarPagination('up')}</ToolbarItem>
        </Toolbar>
      </PageSection>
      <RollingUpgradeConfirmationModal
        isModalOpen={modalType !== null}
        type={modalType || 'sync-all'}
        count={connectedCaches.length}
        confirmAction={() => {
          if (modalType === 'sync-all') props.syncAll();
          else props.disconnectAll();
          setModalType(null);
        }}
        closeModal={() => setModalType(null)}
      />
    </>
  );
};

export { RollingUpgradeStatus };
