import * as React from 'react';
import {useEffect, useState} from 'react';
import dataContainerService from '../../services/dataContainerService'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Label,
  Level,
  LevelItem,
  PageSection,
  Stack,
  StackItem,
  Tab,
  Tabs,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  CatalogIcon,
  ClusterIcon,
  CubesIcon,
  DegradedIcon,
  FolderOpenIcon,
  InfoIcon,
  KeyIcon,
  MemoryIcon,
  MonitoringIcon,
  PendingIcon,
  PlusCircleIcon,
  SaveIcon,
  ServiceIcon,
  Spinner2Icon,
  StorageDomainIcon
} from '@patternfly/react-icons'

import {Link} from "react-router-dom";
import {chart_color_black_100, chart_color_blue_500} from "@patternfly/react-tokens";
import {ChartDonut} from "@patternfly/react-charts";
import displayUtils from "../../services/displayUtils";

const CacheManagers: React.FunctionComponent<any> = (props) => {
  const [cm, setCacheManager] = useState<undefined | CacheManager>(undefined);
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [stats, setStats] = useState<CacheManagerStats>({
    statistics_enabled: false,
    hits: -1,
    retrievals: -1,
    remove_misses: -1,
    remove_hits: -1,
    evictions: -1,
    stores: -1,
    misses: -1
  });
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [counters, setCounters] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);

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

  const TasksContent = () => {
    const isEmpty = tasks.length == 0;
    if (isEmpty) {
      return <EmptyTasks/>;
    }
    return <EmptyTasks/>;
  };

  const EmptyTasks = () => {
    return <EmptyState variant={EmptyStateVariant.small}>
      <EmptyStateIcon icon={CubesIcon}/>
      <Title headingLevel="h5" size="lg">
        Empty
      </Title>
      <EmptyStateBody>
        There are no tasks
      </EmptyStateBody>
    </EmptyState>
  };

  const CountersContent = () => {
    const isEmpty = counters.length == 0;
    if (isEmpty) {
      return <EmptyCounters/>;
    }
    return <EmptyCounters/>;
  };

  const EmptyCounters = () => {
    return <EmptyState variant={EmptyStateVariant.small}>
      <EmptyStateIcon icon={CubesIcon}/>
      <Title headingLevel="h5" size="lg">
        Empty
      </Title>
      <EmptyStateBody>
        There are no counters
      </EmptyStateBody>
    </EmptyState>
  };

  const EmptyCaches = () => {
    return <EmptyState variant={EmptyStateVariant.small}>
      <EmptyStateIcon icon={CubesIcon}/>
      <Title headingLevel="h5" size="lg">
        Empty
      </Title>
      <EmptyStateBody>
        There are no caches
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

  const CacheFeature: React.FunctionComponent<any> = (props) => {
    return (<LevelItem>
      <Tooltip position="right"
               content={
                 <div>{props.tooltip}</div>
               }>
        {props.icon}
      </Tooltip></LevelItem>);
  };

  const hasFeatureColor = (feature) => {
    if (feature) {
      return chart_color_blue_500.value;
    } else {
      return chart_color_black_100.value;
    }
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
        <GridItem id={'id-grid-item' + cache.name} span={4}>
          <Card id={'id-card' + cache.name}>
            <CardHeader id={'id-card-header' + cache.name}>
              <Grid>
                <GridItem span={8}>{cache.name}</GridItem>
                <GridItem span={4}>
                  <Level>
                    <LevelItem><CacheFeature icon={<Spinner2Icon color={hasFeatureColor(cache.bounded)}/>}
                                             tooltip={'Bounded'}/></LevelItem>
                    <LevelItem><CacheFeature icon={<StorageDomainIcon color={hasFeatureColor(cache.indexed)}/>}
                                             tooltip={'Indexed'}/></LevelItem>
                    <LevelItem><CacheFeature icon={<SaveIcon color={hasFeatureColor(cache.persistent)}/>}
                                             tooltip={'Persisted'}/></LevelItem>
                    <LevelItem><CacheFeature icon={<ServiceIcon color={hasFeatureColor(cache.transactional)}/>}
                                             tooltip={'Transactional'}/></LevelItem>
                    <LevelItem><CacheFeature icon={<KeyIcon color={hasFeatureColor(cache.secured)}/>}
                                             tooltip={'Secured'}/></LevelItem>
                    <LevelItem><CacheFeature icon={<DegradedIcon color={hasFeatureColor(cache.hasRemoteBackup)}/>}
                                             tooltip={'Has remote backups'}/></LevelItem>
                  </Level>
                </GridItem>
              </Grid>
            </CardHeader>
            <CardBody id={'id-card-body' + cache.name}>
              <Stack gutter="sm">
                <StackItem><Label
                  style={{backgroundColor: displayUtils.cacheTypeColor(cache.type)}}>{cache.type}</Label></StackItem>
                <StackItem isFilled>Size {cache.size}</StackItem>
                <StackItem>
                  <Link to={{
                    pathname: '/cache/' + cache.name,
                    state: {
                      cacheName: cache.name,
                    }
                  }}><InfoIcon/> Display details</Link></StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      )}
    </Grid>;
  };

  const DisplayStats = () => {
    const allOps = function () {
      return stats != undefined && stats.statistics_enabled ?
        stats.hits +
        stats.retrievals +
        stats.remove_hits +
        stats.remove_misses +
        stats.stores +
        stats.misses +
        stats.evictions : 0;
    };

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
            <CardHeader><MemoryIcon/>{' ' + 'Content'}</CardHeader>
            <CardBody>
              <Stack>
                <StackItem><strong># Number of entries </strong> {stats.number_of_entries}</StackItem>
                <StackItem><strong># Current number of entries in
                  memory </strong> {stats.current_number_of_entries_in_memory}</StackItem>
                <StackItem><strong># Total number of entries </strong> {stats.total_number_of_entries}</StackItem>
                <StackItem><strong># Data memory used </strong> {stats.data_memory_used}</StackItem>
                <StackItem><strong># Off heap memory used </strong> {stats.off_heap_memory_used}</StackItem>
              </Stack>
            </CardBody>
          </Card>

        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardHeader><MonitoringIcon/> {' ' + ' Operations Performance\n'}</CardHeader>
            <CardBody>
              <Stack>
                <StackItem><strong># Avg READS </strong> {stats.average_read_time}</StackItem>
                <StackItem><strong># Avg REMOVES </strong> {stats.average_remove_time}</StackItem>
                <StackItem><strong># Avg WRITES </strong> {stats.average_write_time}</StackItem>
                <StackItem><strong># Read/Write Ratio </strong> {stats.read_write_ratio}</StackItem>
                <StackItem><strong># Hits Ratio </strong> {stats.hit_ratio}</StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={8}>
          <Card>
            <CardHeader><FolderOpenIcon/> {' ' + 'Data access'}</CardHeader>
            <CardBody>
              <div style={{height: '208px', width: '400px'}}>
                <ChartDonut
                  constrainToVisibleArea={true}
                  data={[{x: 'Hits', y: stats.hits},
                    {x: 'Misses', y: stats.misses},
                    {x: 'Stores', y: stats.stores},
                    {x: 'Retrievals', y: stats.retrievals},
                    {x: 'Remove Hits', y: stats.remove_hits},
                    {x: 'Removes Misses', y: stats.remove_misses},
                    {x: 'Evictions', y: stats.evictions}]}
                  labels={({datum}) => `${datum.x}: ${datum.y}%`}
                  legendData={[
                    {name: 'Hits: ' + stats.hits},
                    {name: 'Misses: ' + stats.misses},
                    {name: 'Retrievals: ' + stats.retrievals},
                    {name: 'Stores: ' + stats.stores},
                    {name: 'Remove Hits: ' + stats.remove_hits},
                    {name: 'Remove Misses: ' + stats.remove_misses},
                    {name: 'Evictions: ' + stats.evictions},
                  ]}
                  legendOrientation="vertical"
                  legendPosition="right"
                  padding={{
                    bottom: 40,
                    left: 80,
                    right: 200, // Adjusted to accommodate legend
                    top: 20
                  }}
                  subTitle="Data access"
                  title={'' + allOps()}
                  width={400}
                />
              </div>
            </CardBody>
          </Card>

        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardHeader><PendingIcon/>{' ' + 'Cache manager lifecycle'}</CardHeader>
            <CardBody>
              <Stack style={{height: '208px'}}>
                <StackItem><strong># Time since start </strong> {stats.time_since_start}</StackItem>
                <StackItem><strong># Time since reset </strong> {stats.time_since_reset}</StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
  };

  const DisplayCluster = () => {
    return cm == undefined ? <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon}/>
        <EmptyStateBody>
          The cluster is empty
        </EmptyStateBody>
      </EmptyState> :
      <Card>
        <CardHeader><ClusterIcon/> <strong>{' ' + cm.cluster_name}</strong></CardHeader>
        <CardBody>
          <Stack gutter="md">
            <StackItem><Label
              style={{backgroundColor: displayUtils.healthColor(cm.health)}}>{cm.health}</Label></StackItem>
            <StackItem>Size <strong>{cm.cluster_size}</strong></StackItem>
            <StackItem><strong>{cm.cluster_members}</strong></StackItem>
            <StackItem><strong>{cm.cluster_members_physical_addresses}</strong></StackItem>
          </Stack>
        </CardBody>
      </Card>;
  };

  const DisplayTabs = () => {
    let clusteringLabel = 'Cluster info';
    if (cm != undefined) {
      clusteringLabel = 'Cluster of ' + cm.cluster_size;
    }
    return <Tabs isFilled activeKey={activeTabKey} onSelect={handleTabClick}>
      <Tab eventKey={0} title={caches.length + ' Caches'}>
        <CachesContent/>
      </Tab>
      <Tab eventKey={1} title={counters.length + ' Counters'}>
        <CountersContent/>
      </Tab>
      <Tab eventKey={2} title={tasks.length + ' Tasks'}>
        <TasksContent/>
      </Tab>
      <Tab eventKey={3} title="Global Statistics">
        <DisplayStats/>
      </Tab>
      <Tab eventKey={4} title={clusteringLabel}>
        <DisplayCluster/>
      </Tab>
    </Tabs>
  };

  const DisplayCacheManager = () => {
    return cm != undefined ?
      <Stack gutter="sm">
        <StackItem><strong>Id:</strong> {cm.name} is <Label>{cm.cache_manager_status}</Label></StackItem>
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
