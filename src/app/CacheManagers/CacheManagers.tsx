import * as React from 'react';
import { useEffect, useState } from 'react';
import dataContainerService from '../../services/dataContainerService';
import {
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
  PageSection,
  Stack,
  StackItem,
  Tab,
  Tabs,
  Title,
  Tooltip
} from '@patternfly/react-core';
import {
  CubesIcon,
  FolderOpenIcon,
  MemoryIcon,
  MonitoringIcon,
  PendingIcon,
  RegistryIcon,
  VolumeIcon
} from '@patternfly/react-icons';
import { chart_color_blue_400 } from '@patternfly/react-tokens';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import displayUtils from '../../services/displayUtils';
import tasksService from '../../services/tasksService';
import countersService from '../../services/countersService';
import { CacheTableDisplay } from '@app/CacheManagers/CacheTableDisplay';
import { ClusterDisplay } from '@app/CacheManagers/ClusterDisplay';

const CacheManagers = () => {
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
  const [cachesPagination, setCachesPagination] = useState({
    page: 1,
    perPage: 6
  });
  const [counters, setCounters] = useState<Counter[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const onSetPage = (_event, pageNumber) => {
    setCachesPagination({
      page: pageNumber,
      perPage: cachesPagination.perPage
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setCachesPagination({
      page: cachesPagination.page,
      perPage: perPage
    });
  };

  useEffect(() => {
    dataContainerService.getCacheManagers().then(cacheManagers => {
      if (cacheManagers.length > 0) {
        setCacheManager(cacheManagers[0]);
        dataContainerService
          .getCacheManagerStats(cacheManagers[0].name)
          .then(detailedStats => setStats(detailedStats));
        dataContainerService
          .getCaches(cacheManagers[0].name)
          .then(caches => setCaches(caches));
      }
    });
  }, []);

  useEffect(() => {
    tasksService.getTasks().then(tasks => setTasks(tasks));
  }, []);

  useEffect(() => {
    countersService.getCounters().then(counters => setCounters(counters));
  }, []);

  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  const TasksContent = () => {
    const isEmpty = tasks.length == 0;
    if (isEmpty) {
      return <EmptyTasks />;
    }
    return <TasksGrid />;
  };

  const EmptyTasks = () => {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={CubesIcon} />
        <Title headingLevel="h5" size="lg">
          Empty
        </Title>
        <EmptyStateBody>There are no tasks</EmptyStateBody>
      </EmptyState>
    );
  };

  const TasksGrid = () => {
    return (
      <Grid gutter="sm" style={{ paddingTop: 40 }}>
        {tasks.map(task => (
          <GridItem key={task.name} span={4}>
            <Card id={'id-task-' + task.name}>
              <CardHeader id={'task-id-header-' + task.name}>
                <Tooltip
                  position="right"
                  content={
                    <div>
                      {task.execution_mode == 'ONE_NODE'
                        ? 'One node execution mode'
                        : 'All nodes execution mode'}
                    </div>
                  }
                >
                  {task.execution_mode == 'ONE_NODE' ? (
                    <VolumeIcon style={{ color: chart_color_blue_400.value }} />
                  ) : (
                    <RegistryIcon />
                  )}
                </Tooltip>
                <strong style={{ color: chart_color_blue_400.value }}>
                  {' ' + task.name}
                </strong>
              </CardHeader>
              <CardBody id={'task-id-nody-' + task.name}>
                <Stack>
                  <StackItem>
                    <strong>Context name:</strong>
                    {' ' + task.task_context_name}
                  </StackItem>
                  <StackItem>
                    <strong>Operation name:</strong>
                    {' ' + task.task_operation_name}
                  </StackItem>
                  <StackItem>
                    <strong>Type:</strong>
                    {' ' + task.type}
                  </StackItem>
                  <StackItem>
                    <strong>Parameters:</strong>
                    {task.parameters.map((param, index) => (
                      <span key={index}>{' [' + param + ']'}</span>
                    ))}
                  </StackItem>
                  <StackItem>
                    <strong>Allowed role:</strong>
                    {task.allowed_role == null
                      ? ' empty'
                      : ' ' + task.allowed_role}
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    );
  };

  const CountersContent = () => {
    const isEmpty = counters.length == 0;
    if (isEmpty) {
      return <EmptyCounters />;
    }
    return <CountersGrid />;
  };

  const CountersGrid = () => {
    return (
      <Grid gutter="sm" style={{ paddingTop: 40 }}>
        {counters.map(counter => (
          <GridItem key={counter.name} span={4}>
            <Card id={'id-counter-' + counter.name}>
              <CardHeader id={'counter-id-header-' + counter.name}>
                <strong style={{ color: chart_color_blue_400.value }}>
                  {' ' + counter.name}
                </strong>
              </CardHeader>
              <CardBody id={'counter-id-body-' + counter.name}>
                <Stack>
                  <StackItem>
                    <strong>Value:</strong>
                    {' ' + counter.value}
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    );
  };

  const EmptyCounters = () => {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={CubesIcon} />
        <Title headingLevel="h5" size="lg">
          Empty
        </Title>
        <EmptyStateBody>There are no counters</EmptyStateBody>
      </EmptyState>
    );
  };

  const DisplayStats = () => {
    const allOps = function() {
      return stats != undefined && stats.statistics_enabled
        ? stats.hits +
            stats.retrievals +
            stats.remove_hits +
            stats.remove_misses +
            stats.stores +
            stats.misses +
            stats.evictions
        : 0;
    };

    return !stats.statistics_enabled ? (
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon} />
        <Title headingLevel="h5" size="lg">
          Statistics are not enabled
        </Title>
        <EmptyStateBody>
          Statistics are not enabled in this Cache Manager. To activate
          statistics, set statistics=true in the configuration.
        </EmptyStateBody>
      </EmptyState>
    ) : (
      <Grid gutter="md" style={{ paddingTop: 40 }}>
        <GridItem span={6}>
          <Card>
            <CardHeader>
              <MemoryIcon />
              {' ' + 'Content'}
            </CardHeader>
            <CardBody>
              <Stack>
                <StackItem>
                  <strong># Number of entries </strong>{' '}
                  {stats.number_of_entries}
                </StackItem>
                <StackItem>
                  <strong># Current number of entries in memory </strong>{' '}
                  {stats.current_number_of_entries_in_memory}
                </StackItem>
                <StackItem>
                  <strong># Total number of entries </strong>{' '}
                  {stats.total_number_of_entries}
                </StackItem>
                <StackItem>
                  <strong># Data memory used </strong> {stats.data_memory_used}
                </StackItem>
                <StackItem>
                  <strong># Off heap memory used </strong>{' '}
                  {stats.off_heap_memory_used}
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardHeader>
              <MonitoringIcon /> {' ' + ' Operations Performance\n'}
            </CardHeader>
            <CardBody>
              <Stack>
                <StackItem>
                  <strong># Avg READS </strong> {stats.average_read_time}
                </StackItem>
                <StackItem>
                  <strong># Avg REMOVES </strong> {stats.average_remove_time}
                </StackItem>
                <StackItem>
                  <strong># Avg WRITES </strong> {stats.average_write_time}
                </StackItem>
                <StackItem>
                  <strong># Read/Write Ratio </strong> {stats.read_write_ratio}
                </StackItem>
                <StackItem>
                  <strong># Hits Ratio </strong> {stats.hit_ratio}
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={8}>
          <Card>
            <CardHeader>
              <FolderOpenIcon /> {' ' + 'Data access'}
            </CardHeader>
            <CardBody>
              <div style={{ height: '208px', width: '400px' }}>
                <ChartDonut
                  constrainToVisibleArea={true}
                  data={[
                    { x: 'Hits', y: stats.hits },
                    { x: 'Misses', y: stats.misses },
                    { x: 'Stores', y: stats.stores },
                    { x: 'Retrievals', y: stats.retrievals },
                    { x: 'Remove Hits', y: stats.remove_hits },
                    { x: 'Removes Misses', y: stats.remove_misses },
                    { x: 'Evictions', y: stats.evictions }
                  ]}
                  labels={({ datum }) => `${datum.x}: ${datum.y}%`}
                  legendData={[
                    { name: 'Hits: ' + stats.hits },
                    { name: 'Misses: ' + stats.misses },
                    { name: 'Retrievals: ' + stats.retrievals },
                    { name: 'Stores: ' + stats.stores },
                    { name: 'Remove Hits: ' + stats.remove_hits },
                    { name: 'Remove Misses: ' + stats.remove_misses },
                    { name: 'Evictions: ' + stats.evictions }
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
                  themeColor={ChartThemeColor.multiOrdered}
                />
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardHeader>
              <PendingIcon />
              {' ' + 'Cache manager lifecycle'}
            </CardHeader>
            <CardBody>
              <Stack style={{ height: '208px' }}>
                <StackItem>
                  <strong># Time since start </strong> {stats.time_since_start}
                </StackItem>
                <StackItem>
                  <strong># Time since reset </strong> {stats.time_since_reset}
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    );
  };

  const DisplayTabs = () => {
    let clusteringLabel = 'Cluster info';
    if (cm != undefined) {
      clusteringLabel = 'Cluster of ' + cm.cluster_size;
    }
    return (
      <Tabs isFilled activeKey={activeTabKey} onSelect={handleTabClick}>
        <Tab eventKey={0} title={caches.length + ' Caches'}>
          <CacheTableDisplay caches={caches} cacheManager={cm} />
        </Tab>
        <Tab eventKey={1} title={counters.length + ' Counters'}>
          <CountersContent />
        </Tab>
        <Tab eventKey={2} title={tasks.length + ' Tasks'}>
          <TasksContent />
        </Tab>
        <Tab eventKey={3} title="Global Statistics">
          <DisplayStats />
        </Tab>
        <Tab eventKey={4} title={clusteringLabel}>
          <ClusterDisplay cacheManager={cm} />
        </Tab>
      </Tabs>
    );
  };

  const DisplayCacheManager = () => {
    if (cm === undefined) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon} />
          <Title headingLevel="h5" size="lg">
            Data container
          </Title>
          <EmptyStateBody>Data container is empty</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <Grid gutter="sm">
        <GridItem span={3}>
          <strong>Id:</strong> {' ' + cm.name}
        </GridItem>
        <GridItem span={9}>
          <strong>{'Status: '}</strong>
          <Label
            style={{
              backgroundColor: displayUtils.statusColor(cm.cache_manager_status)
            }}
          >
            {' ' + cm.cache_manager_status}
          </Label>
        </GridItem>
        <GridItem>
          <DisplayTabs />
        </GridItem>
      </Grid>
    );
  };

  return (
    <PageSection>
      <DisplayCacheManager />
    </PageSection>
  );
};

export { CacheManagers };
