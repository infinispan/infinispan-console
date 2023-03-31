import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  Tabs,
  TabsComponent,
  TabTitleText,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { CacheMetrics } from '@app/Caches/CacheMetrics';
import { CacheEntries } from '@app/Caches/Entries/CacheEntries';
import { CacheConfiguration } from '@app/Caches/Configuration/CacheConfiguration';
import { CacheTypeBadge } from '@app/Common/CacheTypeBadge';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { global_danger_color_200 } from '@patternfly/react-tokens';
import { AngleDownIcon, AngleRightIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { QueryEntries } from '@app/Caches/Query/QueryEntries';
import { Link } from 'react-router-dom';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { useCacheDetail } from '@app/services/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useTranslation } from 'react-i18next';
import { RebalancingCache } from '@app/Rebalancing/RebalancingCache';
import { RedoIcon } from '@patternfly/react-icons';

const DetailCache = (props: { cacheName: string }) => {
  const cacheName = props.cacheName;
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { loading, error, cache, loadCache } = useCacheDetail();
  const [activeTabKey1, setActiveTabKey1] = useState<number | string>(0);
  const [activeTabKey2, setActiveTabKey2] = useState<number | string>(10);
  const [displayShowMore, setDisplayShowMore] = useState<boolean>(true);

  useEffect(() => {
    loadCache(cacheName);
  }, []);

  const buildEntriesTabContent = (queryable: boolean) => {
    if (!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)) {
      return '';
    }

    if (!queryable) {
      return (
        <React.Fragment>
          <CacheEntries cacheName={cacheName} />
        </React.Fragment>
      );
    }
    return (
      <Tabs
        unmountOnExit
        isSecondary={false}
        activeKey={activeTabKey2}
        aria-label="Entries tab"
        component={TabsComponent.nav}
        style={{ backgroundColor: 'white' }}
        onSelect={(event, tabIndex) => setActiveTabKey2(tabIndex)}
      >
        <Tab
          eventKey={10}
          title={<TabTitleText>{t('caches.tabs.entries-manage')}</TabTitleText>}
          data-cy="manageEntriesTab"
        >
          <CacheEntries cacheName={cacheName} />
        </Tab>
        <Tab
          eventKey={13}
          data-cy="queriesTab"
          title={
            <TabTitleText>
              <MoreInfoTooltip
                label={t('caches.tabs.query-values')}
                toolTip={'Use the Ickle query language to search values.'}
              />
            </TabTitleText>
          }
        >
          <QueryEntries cacheName={cacheName} indexed={cache?.features.indexed} changeTab={() => setActiveTabKey1(2)} />
        </Tab>
      </Tabs>
    );
  };

  const buildDetailContent = () => {
    if (error.length > 0) {
      return (
        <Card>
          <CardBody>
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={ExclamationCircleIcon} color={global_danger_color_200.value} />
              <Title headingLevel="h2" size="lg">
                {`An error occurred while retrieving cache ${cacheName}`}
              </Title>
              <EmptyStateBody>{error}</EmptyStateBody>
              <EmptyStatePrimary>
                <Link
                  to={{
                    pathname: '/'
                  }}
                >
                  <Button variant={ButtonVariant.secondary}>Back</Button>
                </Link>
              </EmptyStatePrimary>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    if (loading || !cache) {
      return (
        <Card>
          <CardBody>
            <Spinner size="xl" />
          </CardBody>
        </Card>
      );
    }

    if (
      activeTabKey1 == 0 &&
      cache.editable &&
      ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)
    ) {
      return <React.Fragment>{buildEntriesTabContent(cache.queryable)}</React.Fragment>;
    } else if (activeTabKey1 == 2) {
      return <CacheMetrics cacheName={cacheName} display={activeTabKey1 == 2} />;
    } else {
      return (
        <CacheConfiguration cacheName={cache.name} editable={cache.editable} config={cache.configuration.config} />
      );
    }
  };

  const buildBackupsManage = () => {
    if (!cache?.features.hasRemoteBackup) return;

    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    return (
      <React.Fragment>
        <ToolbarItem>
          <Divider orientation={{ default: 'vertical' }} />
        </ToolbarItem>
        <ToolbarItem>
          <Label>Backups</Label>
        </ToolbarItem>
        <ToolbarItem>
          <Link
            to={{
              pathname: encodeURIComponent(cacheName) + '/backups'
            }}
          >
            <Button variant={ButtonVariant.link}>Manage</Button>
          </Link>
        </ToolbarItem>
      </React.Fragment>
    );
  };

  const buildDisplayReindexing = () => {
    if (!cache?.indexing_in_progress) {
      return;
    }

    return (
      <React.Fragment>
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <Spinner size={'md'} />
        </FlexItem>
        <FlexItem>
          <TextContent>
            <Text component={TextVariants.small}>{`Rebuilding the index for ${cacheName}`}</Text>
          </TextContent>
        </FlexItem>
      </React.Fragment>
    );
  };

  const buildIndexManage = () => {
    if (!cache?.features.indexed) return;
    return (
      <React.Fragment>
        <ToolbarItem>
          <Flex>
            <Divider orientation={{ default: 'vertical' }} inset={{ default: 'insetMd' }} />
            {buildDisplayReindexing()}
            <FlexItem>
              <Link
                to={{
                  pathname: encodeURIComponent(cacheName) + '/indexing'
                }}
              >
                <Button data-cy="manageIndexesLink" variant={ButtonVariant.link}>
                  {t('caches.actions.action-manage-indexes')}
                </Button>
              </Link>
            </FlexItem>
          </Flex>
        </ToolbarItem>
      </React.Fragment>
    );
  };

  const buildRefreshButton = () => {
    return (
      <React.Fragment>
        <ToolbarItem>
          <Flex>
            <Divider orientation={{ default: 'vertical' }} inset={{ default: 'insetMd' }} />
            <Button
              type="button"
              aria-label={t('caches.actions.refresh')}
              variant="link"
              onClick={() => {
                loadCache(cacheName);
              }}
              icon={<RedoIcon />}
              iconPosition="left"
            >
              {t('caches.actions.refresh')}
            </Button>
          </Flex>
        </ToolbarItem>
      </React.Fragment>
    );
  };

  const buildShowMoreHeader = () => {
    if (!cache) {
      return '';
    }

    if (
      cache.features.indexed ||
      cache.features.hasRemoteBackup ||
      cache.features.secured ||
      cache.features.persistent ||
      cache.features.transactional ||
      cache.features.bounded
    ) {
      if (displayShowMore) {
        return (
          <ToolbarItem>
            <Button
              isSmall
              icon={<AngleDownIcon />}
              variant={ButtonVariant.link}
              onClick={() => setDisplayShowMore(false)}
            >
              {t('caches.actions.action-see-less')}
            </Button>
          </ToolbarItem>
        );
      }

      return (
        <ToolbarItem>
          <Button
            isSmall
            icon={<AngleRightIcon />}
            variant={ButtonVariant.link}
            onClick={() => setDisplayShowMore(true)}
          >
            {t('caches.actions.action-see-more')}
          </Button>
        </ToolbarItem>
      );
    }

    return '';
  };

  const buildShowMorePanel = () => {
    if (!displayShowMore || !cache) {
      return '';
    }

    return (
      <React.Fragment>
        <ToolbarGroup>
          <ToolbarItem>
            <TextContent>
              <Text component={TextVariants.h4}>{displayUtils.createFeaturesString(cache.features)}</Text>
            </TextContent>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <RebalancingCache />
          {buildBackupsManage()}
          {buildIndexManage()}
          {buildRefreshButton()}
        </ToolbarGroup>
      </React.Fragment>
    );
  };

  const displayCacheEntries = () => {
    if (!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser) || !cache?.editable) {
      return '';
    }

    return (
      <Tab
        data-cy="cacheEntriesTab"
        eventKey={0}
        title={
          cache.size
            ? t('caches.tabs.entries-size', { size: displayUtils.formatNumber(cache?.size) })
            : t('caches.tabs.entries')
        }
      />
    );
  };

  const displayConfiguration = () => {
    let eventKey = 1;
    if (!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser) || !cache.editable) {
      eventKey = 0;
    }

    return <Tab data-cy="cacheConfigurationTab" eventKey={eventKey} title={t('caches.tabs.configuration')} />;
  };

  const displayCacheStats = () => {
    if (!cache.stats) {
      return '';
    }

    return (
      <Tab
        data-cy="cacheMetricsTab"
        eventKey={2}
        title={cache.stats?.enabled ? t('caches.tabs.metrics-enabled') : t('caches.tabs.metrics-disabled')}
      />
    );
  };

  const buildCacheHeader = () => {
    if (loading || !cache) {
      return (
        <Toolbar id="cache-detail-header">
          <ToolbarGroup>
            <ToolbarContent style={{ paddingLeft: 0 }}>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>{t('caches.info.loading', { cacheName: cacheName })}</Text>
                </TextContent>
              </ToolbarItem>
            </ToolbarContent>
          </ToolbarGroup>
        </Toolbar>
      );
    }

    if (error != '') {
      return (
        <Toolbar id="cache-detail-header">
          <ToolbarGroup>
            <ToolbarContent style={{ paddingLeft: 0 }}>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>{t('caches.info.error', { cacheName: cacheName })}</Text>
                </TextContent>
              </ToolbarItem>
            </ToolbarContent>
          </ToolbarGroup>
        </Toolbar>
      );
    }

    return (
      <React.Fragment>
        <Toolbar id="cache-detail-header">
          <ToolbarGroup>
            <ToolbarContent style={{ paddingLeft: 0 }}>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>{cache.name}</Text>
                </TextContent>
              </ToolbarItem>
              <ToolbarItem>
                <CacheTypeBadge cacheType={cache.type} small={false} cacheName={cache.name} />
              </ToolbarItem>
              {buildShowMoreHeader()}
            </ToolbarContent>
          </ToolbarGroup>
          {buildShowMorePanel()}
        </Toolbar>
        <Tabs
          isBox={false}
          activeKey={activeTabKey1}
          isSecondary={true}
          component={TabsComponent.nav}
          onSelect={(event, tabIndex) => {
            setActiveTabKey1(tabIndex);
            if (tabIndex == 0 || tabIndex == 2) {
              loadCache(cacheName);
            }
          }}
        >
          {displayCacheEntries()}
          {displayConfiguration()}
          {displayCacheStats()}
        </Tabs>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light} style={{ paddingBottom: 0 }}>
        <DataContainerBreadcrumb currentPage={t('caches.info.breadcrumb', { cacheName: cacheName })} />
        {buildCacheHeader()}
      </PageSection>
      <PageSection>{buildDetailContent()}</PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
