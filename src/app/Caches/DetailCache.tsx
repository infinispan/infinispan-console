import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Badge,
  Bullseye,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant, Nav, NavItem, NavList,
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
  ToolbarItemVariant
} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import displayUtils from '../../services/displayUtils';
import {CacheMetrics} from '@app/Caches/CacheMetrics';
import {CacheEntries} from '@app/Caches/CacheEntries';
import {CacheConfiguration} from '@app/Caches/CacheConfiguration';
import {CacheTypeBadge} from '@app/Common/CacheTypeBadge';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import {useLocation} from 'react-router';
import {global_danger_color_200, global_spacer_md, global_spacer_sm} from '@patternfly/react-tokens';
import {AngleDownIcon, AngleRightIcon, ExclamationCircleIcon} from '@patternfly/react-icons';
import {QueryEntries} from "@app/Caches/QueryEntries";
import {RecentActivityTable} from "@app/Caches/RecentActivityTable";
import {Link} from "react-router-dom";
import {MoreInfoTooltip} from "@app/Common/MoreInfoTooltip";

const DetailCache = props => {
  let location = useLocation();
  const [activeTabKey1, setActiveTabKey1] = useState< number | string>(0);
  const [activeTabKey2, setActiveTabKey2] = useState< number | string>(10);
  const [cacheName, setCacheName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [detail, setDetail] = useState<DetailedInfinispanCache | undefined>(
    undefined
  );
  const [displayShowMore, setDisplayShowMore] = useState<boolean>(false);
  const [xSite, setXSite] = useState<XSite[]>([]);

  useEffect(() => {
    let locationCacheName = location.pathname.substr(7);
    setCacheName(locationCacheName);
    setLoading(true);
  }, [location]);

  useEffect(() => {
    if(cacheName == '') return;
    loadCacheDetail();

  }, [cacheName]);

  const loadCacheDetail = () => {
    cacheService.retrieveFullDetail(cacheName).then(eitherDetail => {
      setLoading(false);
      if (eitherDetail.isRight()) {
        setDetail(eitherDetail.value);
        if (eitherDetail.value.features.hasRemoteBackup) {
          cacheService.retrieveXSites(cacheName).then(xsites => {
            setXSite(xsites);
          });
        }
      } else {
        setError(eitherDetail.value.message);
      }
    });
  };

  const buildEntriesTabContent = () => {
    return (
          <Tabs unmountOnExit
                isSecondary={false}
                activeKey={activeTabKey2}
                aria-label="Entries tab"
                component={TabsComponent.nav}
                style={{backgroundColor: "white"}}
                onSelect={(event, tabIndex) => setActiveTabKey2(tabIndex)}>
            <Tab eventKey={10} title={<TabTitleText>Manage Entries</TabTitleText>} >
              <CacheEntries cacheName={cacheName} load={loadCacheDetail}/>
              <RecentActivityTable cacheName={cacheName} />
            </Tab>
            <Tab eventKey={11} title={<TabTitleText><MoreInfoTooltip label={'Query Values'} toolTip={'Use Ickle query language'}/></TabTitleText>} >
              <QueryEntries cacheName={cacheName} changeTab={() => setActiveTabKey1(2)}/>
            </Tab>
          </Tabs>
    )
  }

  const buildDetailContent = () => {
    if (loading) {
      return <Spinner size="xl" />;
    }
    if (error.length > 0) {
      return (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>
                <EmptyStateIcon
                  icon={ExclamationCircleIcon}
                  color={global_danger_color_200.value}
                />
                <Title headingLevel="h2" size="lg">
                  Error retrieving cache {cacheName}
                </Title>
                <EmptyStateBody>{error}</EmptyStateBody>
              </EmptyState>
            </Bullseye>
      );
    }

    return (
      <React.Fragment>
          {activeTabKey1 == 0 ?  buildEntriesTabContent() : ''}
          {activeTabKey1 == 1 ?  <CacheConfiguration config={detail?.configuration}/> : ''}
          {activeTabKey1 == 2 ?  <CacheMetrics cacheName={cacheName} display={activeTabKey1 == 2}/> : ''}
      </React.Fragment>
    );
  };

  const buildRebalancing = () => {
    if(!detail?.rehash_in_progress) {
      return (
        <ToolbarItem>
          <Badge isRead>Rebalanced</Badge>
        </ToolbarItem>
      );
    }
    return (
      <ToolbarItem>
        <Spinner size={'md'}/> Rebalancing
      </ToolbarItem>
    );
  }

  const buildBackupsManage = () => {
    if (!detail?.features.hasRemoteBackup)
      return;
    return (
      <React.Fragment>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
        <ToolbarItem>
          <Badge isRead>Backups</Badge>
        </ToolbarItem>
        <ToolbarItem>
          <Link
            to={{
              pathname:  cacheName + '/backups'
            }}
          >
            <Button variant={ButtonVariant.link}>Manage</Button>
          </Link>
        </ToolbarItem>
      </React.Fragment>
    );
  }

  const buildDisplayRedindexing = () => {
    if(!detail?.indexing_in_progress) {
      return;
    }

    return (
      <ToolbarItem>
          <TextContent>
            <Text component={TextVariants.small}>
              <Spinner size={'md'}/>
              Reindexing
            </Text>
          </TextContent>
      </ToolbarItem>
    )
  }

  const buildIndexManage = () => {
    if (!detail?.features.indexed)
      return;
    return (
      <React.Fragment>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
        {buildDisplayRedindexing()}
        <ToolbarItem>
          <Link
            to={{
              pathname:  cacheName + '/indexation'
            }}
          >
            <Button variant={ButtonVariant.link}>Index Management</Button>
          </Link>
        </ToolbarItem>
      </React.Fragment>
    );
  }

  const buildShowMoreHeader = () => {
    if(!detail) {
      return '';
    }

    if(detail.features.indexed
      || detail.features.hasRemoteBackup
      || detail.features.secured
      || detail.features.persistent
      || detail.features.transactional
      || detail.features.bounded) {

      if(displayShowMore) {
        return (
          <ToolbarItem>
            <AngleDownIcon/><Button variant={ButtonVariant.link} onClick={() => setDisplayShowMore(false)}> See less cache details </Button>
          </ToolbarItem>
        );
      }

      return (
          <ToolbarItem>
            <AngleRightIcon/><Button variant={ButtonVariant.link} onClick={() => setDisplayShowMore(true)}> See more cache details </Button>
          </ToolbarItem>
      );
    }

    return '';
  }

  const buildShowMorePanel = () => {
    if(!displayShowMore || !detail) {
      return '';
    }

    return (
      <React.Fragment>
        <ToolbarGroup>
          <ToolbarItem>
            <TextContent>
              <Text component={TextVariants.h3}>{displayUtils.createFeaturesString(detail.features)}</Text>
            </TextContent>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          {buildRebalancing()}
          {buildBackupsManage()}
          {buildIndexManage()}
        </ToolbarGroup>
      </React.Fragment>
    )
  }

  const buildCacheHeader = () => {
    if (!detail && loading) {
      return (
        <TextContent>
          <Text component={TextVariants.h1}>
            Loading cache {cacheName} ...{' '}
          </Text>
        </TextContent>
      );
    }

    if (!detail) {
      return (
        <TextContent>
          <Text component={TextVariants.h1}>Error loading {cacheName} </Text>
        </TextContent>
      );
    }

    return (
      <React.Fragment>
        <Toolbar id="cache-detail-header">
          <ToolbarGroup>
            <ToolbarContent style={{ paddingLeft: 0}}>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>{detail.name}</Text>
                </TextContent>
              </ToolbarItem>
              <ToolbarItem>
                <CacheTypeBadge cacheType={detail.type} small={false} />
              </ToolbarItem>
              {buildShowMoreHeader()}
            </ToolbarContent>
          </ToolbarGroup>
          {buildShowMorePanel()}
        </Toolbar>
        <Tabs isBox={false}
              activeKey={activeTabKey1}
              isSecondary={true}
              component={TabsComponent.nav}
              onSelect={(event, tabIndex) => setActiveTabKey1(tabIndex)}>
          <Tab eventKey={0} title={'Entries (' + displayUtils.formatNumber(detail?.size) + ')'}></Tab>
          <Tab eventKey={1} title={'Configuration'}/>
          <Tab eventKey={2} title={'Metrics (' +  (detail?.stats?.enabled? 'Enabled' : 'Not enabled') + ')'}/>
        </Tabs>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light} style={{paddingBottom:0}}>
        <DataContainerBreadcrumb currentPage="Cache detail" />
        {buildCacheHeader()}
      </PageSection>
      <PageSection>{buildDetailContent()}</PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
