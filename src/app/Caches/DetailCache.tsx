import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Bullseye,
  Card, CardBody,
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Nav,
  NavItem,
  NavList,
  NavVariants,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import displayUtils from '../../services/displayUtils';
import { Spinner } from '@patternfly/react-core/dist/js/experimental';
import { CacheMetrics } from '@app/Caches/CacheMetrics';
import { CacheEntries } from '@app/Caches/CacheEntries';
import { CacheConfiguration } from '@app/Caches/CacheConfiguration';
import { CacheTypeBadge } from '@app/Common/CacheTypeBadge';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { useLocation } from 'react-router';
import { global_danger_color_200 } from '@patternfly/react-tokens';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const DetailCache = props => {
  let location = useLocation();
  const [cacheName, setCacheName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [detail, setDetail] = useState<DetailedInfinispanCache | undefined>(
    undefined
  );
  const [xSite, setXSite] = useState<XSite[]>([]);
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [showEntries, setShowEntries] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    let locationCacheName = location.pathname.substr(7);
    setCacheName(locationCacheName);
  }, [location]);

  useEffect(() => {
    cacheService.retrieveFullDetail(cacheName).then(eitherDetail => {
      setLoading(false);
      if (eitherDetail.isRight()) {
        setDetail(eitherDetail.value);
        setActiveTabKey('0');
        setShowEntries(true);
        if (eitherDetail.value.features.hasRemoteBackup) {
          cacheService.retrieveXSites(cacheName).then(xsites => {
            setXSite(xsites);
          });
        }
      } else {
        setError(eitherDetail.value.message);
      }
    });
  }, [cacheName]);

  const buildDetailContent = () => {
    if (!detail && loading) {
      return <Spinner size="xl" />;
    }

    if (error && !detail) {
      return (
        <Card>
          <CardBody>
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
          </CardBody>
        </Card>
      );
    }

    return (
      <React.Fragment>
        {showEntries && <CacheEntries cacheName={cacheName} />}
        {showConfig && <CacheConfiguration config={detail?.configuration} />}
        {showMetrics && <CacheMetrics stats={detail?.stats} xSite={xSite} />}
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
        <DataContainerBreadcrumb currentPage="Cache detail" />
        {buildCacheHeader()}
        {!loading && buildTabs()}
      </PageSection>
      <PageSection>{buildDetailContent()}</PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
