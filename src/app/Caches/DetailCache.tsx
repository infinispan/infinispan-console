import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem,
  Nav,
  NavItem,
  NavList,
  NavVariants,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import displayUtils from '../../services/displayUtils';
import { Spinner } from '@patternfly/react-core/dist/js/experimental';
import { CacheMetrics } from '@app/Caches/CacheMetrics';
import { CacheEntries } from '@app/Caches/CacheEntries';
import { CacheConfiguration } from '@app/Caches/CacheConfiguration';
import { CacheTypeBadge } from '@app/Common/CacheTypeBadge';

const DetailCache: React.FunctionComponent<any> = props => {
  const cacheName: string = props.location.state.cacheName;
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<DetailedInfinispanCache | undefined>(
    undefined
  );
  const [xSite, setXSite] = useState<XSite[]>([]);
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [showEntries, setShowEntries] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    cacheService.retrieveFullDetail(cacheName).then(detailedCache => {
      setLoading(false);
      setDetail(detailedCache);
      setActiveTabKey('0');
      setShowEntries(true);
      if (detailedCache.features.hasRemoteBackup) {
        cacheService.retrieveXSites(cacheName).then(xsites => {
          setXSite(xsites);
        });
      }
    });
  }, []);

  const buildDetailContent = () => {
    if (!detail && loading) {
      return <Spinner size="xl" />;
    }

    if (!detail) {
      return <Spinner size="xl" />;
    }

    return (
      <React.Fragment>
        {showEntries && <CacheEntries cacheName={cacheName} />}
        {showConfig && <CacheConfiguration config={detail.configuration} />}
        {showMetrics && <CacheMetrics stats={detail.stats} xSite={xSite} />}
      </React.Fragment>
    );
  };

  const buildTabs = () => {
    if (loading) {
      return '';
    }

    return (
      <Nav onSelect={handleTabClick}>
        <NavList variant={NavVariants.tertiary}>
          <NavItem key="nav-item-0" itemId="0" isActive={activeTabKey === '0'}>
            Entries
          </NavItem>
          <NavItem key="nav-item-1" itemId="1" isActive={activeTabKey === '1'}>
            Configuration
          </NavItem>
          <NavItem key="nav-item-2" itemId="2" isActive={activeTabKey === '2'}>
            Metrics
          </NavItem>
        </NavList>
      </Nav>
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
        <DataToolbar id="cache-detail-header">
          <DataToolbarContent style={{ paddingLeft: 0 }}>
            <DataToolbarItem>
              <TextContent>
                <Text component={TextVariants.h1}>{detail.name}</Text>
              </TextContent>
            </DataToolbarItem>
            <DataToolbarItem>
              <CacheTypeBadge cacheType={detail.type} small={false} />
            </DataToolbarItem>
            <DataToolbarItem>
              <TextContent>
                <Text component={TextVariants.h4}>
                  {displayUtils.createFeaturesString(detail.features)}
                </Text>
              </TextContent>
            </DataToolbarItem>
          </DataToolbarContent>
        </DataToolbar>
      </React.Fragment>
    );
  };

  const handleTabClick = nav => {
    let tabIndex = nav.itemId;
    setActiveTabKey(tabIndex);
    setShowEntries(tabIndex == '0');
    setShowConfig(tabIndex == '1');
    setShowMetrics(tabIndex == '2');
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Breadcrumb>
          <BreadcrumbItem to="/console">Data container</BreadcrumbItem>
          <BreadcrumbItem isActive>Cache detail</BreadcrumbItem>
        </Breadcrumb>
        {buildCacheHeader()}
        {!loading && buildTabs()}
      </PageSection>
      <PageSection>{buildDetailContent()}</PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
