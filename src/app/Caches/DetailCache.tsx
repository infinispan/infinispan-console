import * as React from 'react';
import {useState} from 'react';
import {
  Badge,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateVariant,
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
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import {CacheMetrics} from '@app/Caches/CacheMetrics';
import {CacheEntries} from '@app/Caches/Entries/CacheEntries';
import {CacheConfiguration} from '@app/Caches/Configuration/CacheConfiguration';
import {CacheTypeBadge} from '@app/Common/CacheTypeBadge';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import {global_danger_color_200} from '@patternfly/react-tokens';
import {AngleDownIcon, AngleRightIcon, ExclamationCircleIcon,} from '@patternfly/react-icons';
import {QueryEntries} from '@app/Caches/Query/QueryEntries';
import {Link} from 'react-router-dom';
import {MoreInfoTooltip} from '@app/Common/MoreInfoTooltip';
import {useCacheDetail} from '@app/services/cachesHook';
import {ConsoleServices} from "@services/ConsoleServices";
import {ConsoleACL} from "@services/securityService";
import {useConnectedUser} from "@app/services/userManagementHook";

const DetailCache = (props: { cacheName: string }) => {
  const cacheName = props.cacheName;
  const { connectedUser } = useConnectedUser();
  const { loading, error, cache } = useCacheDetail(cacheName);
  const [activeTabKey1, setActiveTabKey1] = useState<number | string>(ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)? 0:1);
  const [activeTabKey2, setActiveTabKey2] = useState<number | string>(10);
  const [displayShowMore, setDisplayShowMore] = useState<boolean>(true);

  const buildEntriesTabContent = (queryable: boolean) => {
    if(!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)) {
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
        <Tab eventKey={10} title={<TabTitleText>Manage entries</TabTitleText>}>
          <CacheEntries cacheName={cacheName} />
        </Tab>
        <Tab
          eventKey={13}
          title={
            <TabTitleText>
              <MoreInfoTooltip
                label={'Query values in caches.'}
                toolTip={'Use the Ickle query language to search values.'}
              />
            </TabTitleText>
          }
        >
          <QueryEntries
            cacheName={cacheName}
            indexed={cache?.features.indexed}
            changeTab={() => setActiveTabKey1(2)}
          />
        </Tab>
      </Tabs>
    );
  };

  const buildDetailContent = () => {
    if (loading) {
      return (
        <Card>
          <CardBody>
            <Spinner size="xl" />
          </CardBody>
        </Card>
      );
    }

    if (error.length > 0) {
      return (
        <Card>
          <CardBody>
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon
                icon={ExclamationCircleIcon}
                color={global_danger_color_200.value}
              />
              <Title headingLevel="h2" size="lg">
                An error occurred while retrieving cache {cacheName}
              </Title>
              <EmptyStateBody>{error}</EmptyStateBody>
              <EmptyStatePrimary>
                <Link
                  to={{
                    pathname: '/',
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

    return (
      <React.Fragment>
        {activeTabKey1 == 0 ? buildEntriesTabContent(cache.queryable) : ''}
        {activeTabKey1 == 1 ? (
          <CacheConfiguration config={cache.configuration} />
        ) : (
          ''
        )}
        {activeTabKey1 == 2 ? (
          <CacheMetrics cacheName={cacheName} display={activeTabKey1 == 2} />
        ) : (
          ''
        )}
      </React.Fragment>
    );
  };

  const buildRebalancing = () => {
    if (!cache?.rehash_in_progress) {
      return (
        <ToolbarItem>
          <Badge isRead>Rebalanced</Badge>
        </ToolbarItem>
      );
    }
    return (
      <ToolbarItem>
        <Spinner size={'md'} /> Rebalancing
      </ToolbarItem>
    );
  };

  const buildBackupsManage = () => {
    if (!cache?.features.hasRemoteBackup) return;

    if(!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    return (
      <React.Fragment>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
        <ToolbarItem>
          <Badge isRead>Backups</Badge>
        </ToolbarItem>
        <ToolbarItem>
          <Link
            to={{
              pathname: encodeURIComponent(cacheName) + '/backups',
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
      <ToolbarItem>
        <TextContent>
          <Text component={TextVariants.small}>
            <Spinner size={'md'} />
            Rebuilding the index for {cacheName}
          </Text>
        </TextContent>
      </ToolbarItem>
    );
  };

  const buildIndexManage = () => {
    if (!cache?.features.indexed) return;
    return (
      <React.Fragment>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
        {buildDisplayReindexing()}
        <ToolbarItem>
          <Link
            to={{
              pathname: encodeURIComponent(cacheName) + '/indexing',
            }}
          >
            <Button variant={ButtonVariant.link}>Manage indexes</Button>
          </Link>
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
            <AngleDownIcon />
            <Button
              variant={ButtonVariant.link}
              onClick={() => setDisplayShowMore(false)}
            >
              {' '}
              See fewer cache details{' '}
            </Button>
          </ToolbarItem>
        );
      }

      return (
        <ToolbarItem>
          <AngleRightIcon />
          <Button
            variant={ButtonVariant.link}
            onClick={() => setDisplayShowMore(true)}
          >
            {' '}
            See more cache details{' '}
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
              <Text component={TextVariants.h3}>
                {displayUtils.createFeaturesString(cache.features)}
              </Text>
            </TextContent>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          {buildRebalancing()}
          {buildBackupsManage()}
          {buildIndexManage()}
        </ToolbarGroup>
      </React.Fragment>
    );
  };

  const buildCacheHeader = () => {
    if (loading) {
      return (
        <Toolbar id="cache-detail-header">
          <ToolbarGroup>
            <ToolbarContent style={{ paddingLeft: 0 }}>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>
                    Loading cache {cacheName} ...{' '}
                  </Text>
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
                  <Text component={TextVariants.h1}>
                    An error occurred while loading {cacheName}
                  </Text>
                </TextContent>
              </ToolbarItem>
            </ToolbarContent>
          </ToolbarGroup>
        </Toolbar>
      );
    }

    const displayCacheEntries = () => {
      if(!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser)) {
        return '';
      }

      return (
        <Tab
          eventKey={0}
          title={cache.size? 'Entries (' + displayUtils.formatNumber(cache?.size) + ')' : 'Entries'}
        ></Tab>
      )
    }

    const displayCacheStats = () => {
      if(!cache.stats) {
        return '';
      }

      return (
        <Tab
          eventKey={2}
          title={
            'Metrics (' +
            (cache.stats?.enabled ? 'Enabled' : 'Not enabled') +
            ')'
          }
        />
      )
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
                <CacheTypeBadge cacheType={cache.type} small={false} />
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
          onSelect={(event, tabIndex) => setActiveTabKey1(tabIndex)}
        >
          {displayCacheEntries()}
          <Tab eventKey={1} title={'Configuration'} />
          {displayCacheStats()}
        </Tabs>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <PageSection
        variant={PageSectionVariants.light}
        style={{ paddingBottom: 0 }}
      >
        <DataContainerBreadcrumb currentPage={'Detail of cache ' + cacheName} />
        {buildCacheHeader()}
      </PageSection>
      <PageSection>{buildDetailContent()}</PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
