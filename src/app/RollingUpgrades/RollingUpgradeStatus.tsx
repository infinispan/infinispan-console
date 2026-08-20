import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  Label,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { RollingUpgradeConfirmationModal } from './RollingUpgradeConfirmationModals';

const RollingUpgradeStatus = (props: {
  cacheStatuses: CacheUpgradeStatus[];
  syncCache: (name: string) => void;
  disconnectCache: (name: string) => void;
  syncAll: () => void;
  disconnectAll: () => void;
}) => {
  const { t } = useTranslation();
  const [modalType, setModalType] = useState<'sync-all' | 'disconnect-all' | null>(null);

  const connectedCount = props.cacheStatuses.filter((s) => s.connected).length;

  const renderConnectionStatus = (status: CacheUpgradeStatus) => {
    if (status.connected) {
      return <Label color="green">{t('rolling-upgrades.status.connected')}</Label>;
    }
    return <Label color="grey">{t('rolling-upgrades.status.not-connected')}</Label>;
  };

  const renderSyncStatus = (status: CacheUpgradeStatus) => {
    if (!status.connected) return t('rolling-upgrades.status.no-sync');
    if (status.syncing) {
      return <Label color="orange">{t('rolling-upgrades.status.syncing')}</Label>;
    }
    if (status.synced && status.entriesSynced !== undefined) {
      return <Label color="blue">{t('rolling-upgrades.status.synced', { count: status.entriesSynced })}</Label>;
    }
    return t('rolling-upgrades.status.not-synced');
  };

  const renderActions = (status: CacheUpgradeStatus) => {
    if (!status.connected) return null;
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

  return (
    <>
      <PageSection>
        <Content>
          <h1>{t('rolling-upgrades.title')}</h1>
        </Content>
        <Content component="p">
          <Label color="orange">{t('rolling-upgrades.status.in-progress')}</Label>
        </Content>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => setModalType('sync-all')}
                isDisabled={connectedCount === 0}
              >
                {t('rolling-upgrades.actions.sync-all')}
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.danger}
                onClick={() => setModalType('disconnect-all')}
                isDisabled={connectedCount === 0}
              >
                {t('rolling-upgrades.actions.disconnect-all')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label={t('rolling-upgrades.title')} variant="compact">
          <Thead>
            <Tr>
              <Th>{t('rolling-upgrades.status.cache-name')}</Th>
              <Th>{t('rolling-upgrades.status.connection')}</Th>
              <Th>{t('rolling-upgrades.status.sync-status')}</Th>
              <Th>{t('rolling-upgrades.status.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.cacheStatuses.map((status) => (
              <Tr key={status.cacheName}>
                <Td>{status.cacheName}</Td>
                <Td>{renderConnectionStatus(status)}</Td>
                <Td>{renderSyncStatus(status)}</Td>
                <Td>{renderActions(status)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageSection>
      <RollingUpgradeConfirmationModal
        isModalOpen={modalType !== null}
        type={modalType || 'sync-all'}
        count={connectedCount}
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
