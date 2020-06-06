import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Bullseye,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
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
  Title, Card, CardBody
} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import displayUtils from '../../services/displayUtils';
import {CacheMetrics} from '@app/Caches/CacheMetrics';
import {CacheEntries} from '@app/Caches/CacheEntries';
import {CacheConfiguration} from '@app/Caches/CacheConfiguration';
import {CacheTypeBadge} from '@app/Common/CacheTypeBadge';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import {useLocation} from 'react-router';
import {global_danger_color_200} from '@patternfly/react-tokens';
import {ExclamationCircleIcon} from '@patternfly/react-icons';
import {QueryEntries} from "@app/Caches/QueryEntries";
import {RecentActivityTable} from "@app/Caches/RecentActivityTable";

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
                activeKey={activeTabKey2}
                aria-label="Entries tab"
                component={TabsComponent.nav}
                style={{backgroundColor: "white"}}
                onSelect={(event, tabIndex) => setActiveTabKey2(tabIndex)}>
            <Tab eventKey={10} title={<TabTitleText>Manage Entries</TabTitleText>} >
              <CacheEntries cacheName={cacheName} load={loadCacheDetail}/>
              <RecentActivityTable cacheName={cacheName} />
            </Tab>
            <Tab eventKey={11} title={<TabTitleText>Query Values</TabTitleText>} >
              <QueryEntries cacheName={cacheName}/>
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
          {activeTabKey1 == 2 ?  <CacheMetrics stats={detail?.stats} xSite={xSite}/> : ''}
      </React.Fragment>
    );
  };

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
          <ToolbarContent style={{ paddingLeft: 0 }}>
            <ToolbarItem>
              <TextContent>
                <Text component={TextVariants.h1}>{detail.name}</Text>
              </TextContent>
            </ToolbarItem>
            <ToolbarItem>
              <CacheTypeBadge cacheType={detail.type} small={false} />
            </ToolbarItem>
            <ToolbarItem>
              <TextContent>
                <Text component={TextVariants.h4}>
                  {displayUtils.createFeaturesString(detail.features)}
                </Text>
              </TextContent>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Tabs isBox={true}
              activeKey={activeTabKey1}
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
      <PageSection variant={PageSectionVariants.light} style={{marginBottom: 0, paddingBottom: 0}}>
        <DataContainerBreadcrumb currentPage="Cache detail" />
        {buildCacheHeader()}
      </PageSection>
      <PageSection>{buildDetailContent()}</PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
