import * as React from 'react';
import {useEffect, useState} from 'react';
import dataContainerService from '../../services/dataContainerService'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHead,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Label,
  PageSection,
  Stack,
  StackItem,
  Tab,
  Tabs,
  Title,
} from '@patternfly/react-core';
import {CatalogIcon, ClusterIcon, CubesIcon, MonitoringIcon, PendingIcon, PlusCircleIcon} from '@patternfly/react-icons'
import cacheService from "../../services/cacheService";
import {Link} from "react-router-dom";

const CacheManagers: React.FunctionComponent<any> = (props) => {
  const [cm, setCacheManager] = useState<undefined | CacheManager>(undefined);
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [stats, setStats] = useState<CacheManagerStats>({statistics_enabled: false},);
  const [caches, setCaches] = useState<CacheInfo[]>([]);

  useEffect(() => {
    dataContainerService.getCacheManagers()
      .then(cacheManagers => {
        if (cacheManagers.length > 0) {
          setCacheManager(cacheManagers[0]);
          dataContainerService.getCacheManagerStats(cacheManagers[0].name)
            .then(detailedStats => setStats(detailedStats));
          dataContainerService.getCaches(cacheManagers[0].name)
            .then(caches => setCaches(caches));
        }
      });
  }, []);

  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  const CachesContent = () => {
    const isEmpty = caches.length == 0;
    if (isEmpty) {
      return <EmptyCaches/>;
    }
    return <CachesGrid/>;
  };

  const EmptyCaches = () => {
    return <EmptyState variant={EmptyStateVariant.small}>
      <EmptyStateIcon icon={CubesIcon}/>
      <Title headingLevel="h5" size="lg">
        Empty
      </Title>
      <EmptyStateBody>
        There are no caches with those filters
      </EmptyStateBody>
      <CreateCacheButton/>
    </EmptyState>
  };

  const CreateCacheButton = () => {
    return <Link to={{
      pathname: '/caches/create',
      state: {
        cacheManager: cm,
      }
    }}>
      <Button component="a" target="_blank" variant="link" icon={<PlusCircleIcon/>}>
        Create cache
      </Button>
    </Link>;
  };

  const CachesGrid = () => {
    return cm == undefined ? <EmptyCaches/> : <Grid gutter='sm'>
      <GridItem id='id-grid-buttons' span={12}>
        <CreateCacheButton/>
        <Link to={{
          pathname: 'container/' + cm.name + '/configurations/',
          state: {
            cacheManager: cm.name
          }
        }}> <Button variant="link" icon={<CatalogIcon/>}>Configurations </Button>{' '}</Link>
      </GridItem>
      {caches.map(cache =>
        <GridItem id={'id-grid-item' + cache.name} span={3}>
          <Card id={'id-card' + cache.name}>
            <CardHeader id={'id-card-header' + cache.name}>{cache.name}</CardHeader>
            <CardBody id={'id-card-body' + cache.name}>
              <Stack gutter="sm">
                <StackItem><Badge>{cache.type}</Badge></StackItem>
                <StackItem isFilled>Size {cache.size}</StackItem>
                <StackItem>
                  <Link to={{
                    pathname: '/cache/' + cache.name,
                    state: {
                      cacheName: cache.name,
                    }
                  }}>Details</Link></StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      )}
    </Grid>;
  };

  const DisplayStats = () => {
    return !stats.statistics_enabled ? <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon}/>
        <Title headingLevel="h5" size="lg">
          Statistics are not enabled
        </Title>
        <EmptyStateBody>
          Statistics are not enabled in this Cache Manager.
          To activate statistics, set statistics=true in the configuration.
        </EmptyStateBody>
      </EmptyState> :
      <Grid gutter="md">
        <GridItem span={6}>
          <Card>
            <CardHead>
              <PendingIcon/>
            </CardHead>
            <CardHeader>Cache manager lifecycle</CardHeader>
            <CardBody>
              <Stack>
                <StackItem><strong># Time since start </strong> {stats.time_since_start}</StackItem>
                <StackItem><strong># Time since reset </strong> {stats.time_since_reset}</StackItem>
                <StackItem>-</StackItem>
              </Stack>
            </CardBody>
          </Card>

        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardHead>
              <MonitoringIcon/>
            </CardHead>
            <CardHeader>Average values</CardHeader>
            <CardBody>
              <Stack>
                <StackItem><strong># Avg READS </strong> {stats.average_read_time}</StackItem>
                <StackItem><strong># Avg REMOVES </strong> {stats.average_remove_time}</StackItem>
                <StackItem><strong># Avg WRITES </strong> {stats.average_write_time}</StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
  };

  const DisplayTabs = () => {
    return <Tabs isFilled activeKey={activeTabKey} onSelect={handleTabClick}>
      <Tab eventKey={0} title={caches.length + ' Caches'}>
        <CachesContent/>
      </Tab>
      <Tab eventKey={1} title="Global Statistics">
        <DisplayStats/>
      </Tab>
      <Tab eventKey={2
      } title="Clustering">
        Clustering info
      </Tab>
    </Tabs>
  };

  const DisplayCacheManager = () => {
    return cm != undefined ?
      <Stack gutter="sm">
        <StackItem><Label>{cm.cache_manager_status}</Label></StackItem>
        <StackItem><ClusterIcon/> {cm.cluster_name} size <b>{cm.cluster_size}</b></StackItem>
        <DisplayTabs/>
      </Stack> : <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon}/>
        <Title headingLevel="h5" size="lg">
          Data container
        </Title>
        <EmptyStateBody>
          Data container is empty
        </EmptyStateBody>
      </EmptyState>;
  };
  return (
    <PageSection>
      <DisplayCacheManager/>
    </PageSection>
  );
};

export {CacheManagers};
