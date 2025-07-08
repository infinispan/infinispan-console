import * as React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardBody, EmptyState, PageSection, Spinner, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@patternfly/react-component-groups';
import { ExpirationConfigEdition } from '@app/Caches/Configuration/Features/ExpirationConfigEdition';
import BoundedConfigEdition from '@app/Caches/Configuration/Features/BoundedConfigEdition';
import { useCacheDetail } from '@app/services/cachesHook';
import { TableErrorState } from '@app/Common/TableErrorState';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { IndexedConfigEdition } from '@app/Caches/Configuration/Features/IndexedConfigEdition';

interface EditConfigTab {
  key: string;
  name: string;
  eventKey: number;
}

const EditConfiguration = () => {
  const { t } = useTranslation();
  const cacheName = useParams()['cacheName'] as string;
  const { loading, error, cache, loadCache } = useCacheDetail();
  const [activeTabKey, setActiveTabKey] = useState<number>(0);
  const [tabs, setTabs] = useState<EditConfigTab[]>([]);

  useEffect(() => {
    loadCache(cacheName);
  }, []);

  useEffect(() => {
    if (!cache) return;

    const cacheConfigTabs: EditConfigTab[] = [];
    cacheConfigTabs.push({ name: t('caches.edit-configuration.tab-expiration'), key: 'expiration', eventKey: 0 });
    if (cache.features?.bounded) {
      cacheConfigTabs.push({ name: t('caches.edit-configuration.tab-bounded'), key: 'bounded', eventKey: 1 });
    }
    if (cache.features?.indexed) {
      cacheConfigTabs.push({ name: t('caches.edit-configuration.tab-indexed'), key: 'indexed', eventKey: 2 });
    }
    setTabs(cacheConfigTabs);
  }, [cache]);

  const handleTabClick = (index: number) => {
    setActiveTabKey(index);
  };

  const buildTabs = (
    <Tabs data-cy="navigationTabs" activeKey={activeTabKey} onSelect={(_event, tab) => handleTabClick(tab as number)}>
      {tabs.map((tab) => (
        <Tab
          data-cy={'nav-item-' + tab.name}
          aria-label={'nav-item-' + tab.key}
          key={'nav-item-' + tab.key}
          eventKey={tab.eventKey}
          title={<TabTitleText>{tab.name}</TabTitleText>}
        />
      ))}
    </Tabs>
  );

  const buildContent = () => {
    if (loading) {
      return <TableLoadingState message={t('common.loading')} />;
    }

    if (error) {
      return <TableErrorState error={error} />;
    }

    return (
      <React.Fragment>
        {buildTabs}
        <Card isFullHeight isPlain>
          <CardBody>
            {activeTabKey == 0 && <ExpirationConfigEdition />}
            {activeTabKey == 1 && <BoundedConfigEdition />}
            {activeTabKey == 2 && <IndexedConfigEdition />}
          </CardBody>
        </Card>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <DataContainerBreadcrumb currentPage={t('caches.edit-configuration.title')} cacheName={cacheName} />
      <PageHeader title={t('caches.edit-configuration.title')} subtitle={''} />
      <PageSection>{buildContent()}</PageSection>
    </React.Fragment>
  );
};
export { EditConfiguration };
