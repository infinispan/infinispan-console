import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import displayUtils from '../../services/displayUtils';
import {Spinner} from '@patternfly/react-core/dist/js/experimental';
import {CacheMetrics} from '@app/Caches/CacheMetrics';
import {CacheEntries} from '@app/Caches/CacheEntries';
import {CacheConfiguration} from '@app/Caches/CacheConfiguration';
import {CacheTypeBadge} from '@app/Common/CacheTypeBadge';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import {useLocation} from 'react-router';
import {global_danger_color_200} from '@patternfly/react-tokens';
import {ExclamationCircleIcon} from '@patternfly/react-icons';
import {QueryEntries} from "@app/Caches/QueryEntries";

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


  const buildDetailContent = () => {
    if (loading) {
      return <Spinner size="xl" />;
    }
    if (error.length > 0) {
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
      <Card>
        <CardBody>
          <Tabs activeKey={activeTabKey1}
                onSelect={(event, tabIndex) => setActiveTabKey1(tabIndex)}>
            <Tab eventKey={0} title={<TextContent>
              <Text component={TextVariants.h6}>
              {'Entries'}
            </Text>
              <Text component={TextVariants.pre}>
                {displayUtils.formatNumber(detail?.size)}
              </Text>
            </TextContent>}>
              <Tabs activeKey={activeTabKey2} isSecondary
                    onSelect={(event, tabIndex) => setActiveTabKey2(tabIndex)}>
                <Tab eventKey={10} title="Entries by key">
                  <CacheEntries cacheName={cacheName} load={loadCacheDetail}/>
                </Tab>
                <Tab eventKey={11} title="Query values">
                  <QueryEntries cacheName={cacheName}/>
                </Tab>
              </Tabs>
            </Tab>
            <Tab eventKey={1} title={
              <TextContent>
                <Text component={TextVariants.h6}>
                  {'Configuration'}
                </Text>
                <Text component={TextVariants.pre}>
                  Readonly
                </Text>
              </TextContent>
            }>
              <CacheConfiguration config={detail?.configuration}/>
            </Tab>
            <Tab eventKey={2} title={
              <TextContent>
                <Text component={TextVariants.h6}>
                  {'Metrics'}
                </Text>
                <Text component={TextVariants.pre}>
                  {detail?.stats?.enabled? 'Enabled' : 'Not enabled'}
                </Text>
              </TextContent>
            }>
              <CacheMetrics stats={detail?.stats} xSite={xSite}/>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
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

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb currentPage="Cache detail" />
        {buildCacheHeader()}
      </PageSection>
      <PageSection>{buildDetailContent()}</PageSection>
    </React.Fragment>
  );
};

export { DetailCache };
