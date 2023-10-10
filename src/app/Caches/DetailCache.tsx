import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Chip,
  ChipGroup,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
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
import { global_BackgroundColor_100, global_danger_color_200, global_info_color_200 } from '@patternfly/react-tokens';
import { AngleDownIcon, AngleRightIcon, ExclamationCircleIcon, InfoIcon, RedoIcon } from '@patternfly/react-icons';
import { QueryEntries } from '@app/Caches/Query/QueryEntries';
import { Link } from 'react-router-dom';
import { useCacheDetail } from '@app/services/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useTranslation } from 'react-i18next';
import { RebalancingCache } from '@app/Rebalancing/RebalancingCache';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { EncodingType } from '@services/infinispanRefData';

const DetailCache = (props: { cacheName: string }) => {
  const cacheName = props.cacheName;
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const encodingDocs = t('brandname.encoding-docs-link');
  const { connectedUser } = useConnectedUser();
  const { loading, error, cache, loadCache } = useCacheDetail();
  const [activeTabKey1, setActiveTabKey1] = useState<number | string>('');
  const [activeTabKey2, setActiveTabKey2] = useState<number | string>(10);
  const [displayShowMore, setDisplayShowMore] = useState<boolean>(true);

  useEffect(() => {
    loadCache(cacheName);
  }, []);

  useEffect(() => {
    if (activeTabKey1 != '' || !cache) {
      return;
    }

    if (cache.editable && ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)) {
      setActiveTabKey1(0);
    } else if (ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      setActiveTabKey1(1);
    } else {
      setActiveTabKey1(2);
    }
  }, [cache])

  const encodingMessageDisplay = () => {
    if (!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)) {
      return '';
    }
    const encodingKey = CacheConfigUtils.toEncoding(cache.encoding.key);
    const encodingValue = CacheConfigUtils.toEncoding(cache.encoding.value);
    if (
      encodingKey == EncodingType.Java ||
      encodingKey == EncodingType.JBoss ||
      encodingValue == EncodingType.Java ||
      encodingValue == EncodingType.JBoss
    ) {
      return (
        <Card isCompact>
          <CardBody>
            <Alert
              isPlain
              isInline
              title={t('caches.configuration.pojo-encoding', {
                brandname: brandname,
                encodingKey: encodingKey,
                encodingValue: encodingValue
              })}
              variant={AlertVariant.info}
              actionLinks={
                <AlertActionLink onClick={() => window.open(encodingDocs, '_blank')}>
                  {t('caches.configuration.encoding-docs-message')}
                </AlertActionLink>
              }
            />
          </CardBody>
        </Card>
      );
    }
    return '';
  };

  const buildEntriesTabContent = (queryable: boolean) => {
    if (!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)) {
      return '';
    }

    if (!queryable) {
      return (
        <React.Fragment>
          {encodingMessageDisplay()}
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
        style={{ backgroundColor: global_BackgroundColor_100.value }}
        onSelect={(event, tabIndex) => setActiveTabKey2(tabIndex)}
      >
        <Tab
          eventKey={10}
          title={<TabTitleText>{t('caches.tabs.entries-manage')}</TabTitleText>}
          data-cy="manageEntriesTab"
        >
          {encodingMessageDisplay()}
          <CacheEntries cacheName={cacheName} />
        </Tab>
        <Tab eventKey={11} data-cy="queriesTab" title={<TabTitleText>{t('caches.tabs.query-values')}</TabTitleText>}>
          <QueryEntries cacheName={cacheName} indexed={cache?.features.indexed} changeTab={() => setActiveTabKey1(2)} />
        </Tab>
      </Tabs>
    );
  };

  const entriesTabEnabled = (): boolean => {
    return cache.editable && ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser);
  };

  const buildDetailContent = () => {
    if (error.length > 0) {
      return (
        <Card>
          <CardBody>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateHeader
                titleText={<>{`An error occurred while retrieving cache ${cacheName}`}</>}
                icon={<EmptyStateIcon icon={ExclamationCircleIcon} color={global_danger_color_200.value} />}
                headingLevel="h2"
              />
              <EmptyStateBody>{error}</EmptyStateBody>
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Link
                    to={{
                      pathname: '/',
                      search: location.search
                    }}
                  >
                    <Button variant={ButtonVariant.secondary}>{t('caches.actions.back')}</Button>
                  </Link>
                </EmptyStateActions>
              </EmptyStateFooter>
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

    if (activeTabKey1 == 0) {
      return buildEntriesTabContent(cache.queryable);
    }

    if (activeTabKey1 == 1) {
      return (
        cache.configuration &&
        <CacheConfiguration cacheName={cache.name} editable={cache.editable} config={cache.configuration.config} />
      );
    }
    return (
      <CacheMetrics cacheName={cacheName} display={activeTabKey1 == 2} />
    );

    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <EmptyStateHeader
          titleText={<>{`Empty ${cacheName}`}</>}
          icon={<EmptyStateIcon icon={InfoIcon} color={global_info_color_200.value} />}
          headingLevel="h2"
        />
        <EmptyStateBody>{error}</EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Link
              to={{
                pathname: '/',
                search: location.search
              }}
            >
              <Button variant={ButtonVariant.secondary}>{t('caches.actions.back')}</Button>
            </Link>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  };

  const buildBackupsManage = () => {
    if (!cache?.features.hasRemoteBackup) return;

    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    return (
      <React.Fragment>
        <ToolbarItem>
          <Divider style={{ margin: 0 }} orientation={{ default: 'vertical' }} />
        </ToolbarItem>
        <ToolbarItem>
          <Label>Backups</Label>
        </ToolbarItem>
        <ToolbarItem>
          <Link
            to={{
              pathname: encodeURIComponent(cacheName) + '/backups',
              search: location.search
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
      <ToolbarItem>
        <Flex>
          <Divider style={{ margin: 0 }} orientation={{ default: 'vertical' }} />
          {buildDisplayReindexing()}
          <FlexItem>
            <Link
              to={{
                pathname: encodeURIComponent(cacheName) + '/indexing',
                search: location.search
              }}
            >
              <Button data-cy="manageIndexesLink" variant={ButtonVariant.link}>
                {t('caches.actions.action-manage-indexes')}
              </Button>
            </Link>
          </FlexItem>
        </Flex>
      </ToolbarItem>
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

  const buildFeaturesChip = () => {
    if (!cache?.features) return;
    return (
      <ToolbarItem>
        <Flex>
          <Divider orientation={{ default: 'vertical' }} />

          <ChipGroup categoryName="Features">
            {displayUtils.createFeaturesChipGroup(cache.features).map((feature) => (
              <Chip isReadOnly key={feature}>
                {feature}
              </Chip>
            ))}
          </ChipGroup>
        </Flex>
      </ToolbarItem>
    );
  };

  const buildShowMoreHeader = () => {
    if (!cache) {
      return '';
    }

    const icon = displayShowMore ? <AngleDownIcon /> : <AngleRightIcon />;

    return (
      <ToolbarItem>
        <Button size="sm" icon={icon} variant={ButtonVariant.link} onClick={() => setDisplayShowMore(!displayShowMore)}>
          {displayShowMore ? t('caches.actions.action-see-less') : t('caches.actions.action-see-more')}
        </Button>
      </ToolbarItem>
    );
  };

  const buildShowMorePanel = () => {
    if (!displayShowMore || !cache) {
      return '';
    }

    return (
      <ToolbarGroup>
        <RebalancingCache />
        {buildFeaturesChip()}
        {buildBackupsManage()}
        {buildIndexManage()}
      </ToolbarGroup>
    );
  };

  const displayCacheEntries = () => {
    if (!entriesTabEnabled()) {
      return;
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
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      // Only ADMIN can read the full configuration for security reasons
      return;
    }

    return (
      <Tab data-cy="cacheConfigurationTab" eventKey={1} title={t('caches.tabs.configuration')} />
    );
  };

  const displayCacheStats = () => {
    if (!cache.stats) {
      return;
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
              {buildRefreshButton()}
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
