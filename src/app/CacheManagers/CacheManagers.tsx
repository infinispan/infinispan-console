import * as React from 'react';
import {useEffect, useState} from 'react';
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
  PageSection,
  Stack,
  StackItem,
  Tab,
  Tabs,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import {
  CubesIcon,
  ErrorCircleOIcon,
  InProgressIcon,
  OffIcon,
  OkIcon,
  RegistryIcon,
  VolumeIcon
} from '@patternfly/react-icons';
import {chart_color_blue_400} from '@patternfly/react-tokens';
import displayUtils from '../../services/displayUtils';
import tasksService from '../../services/tasksService';
import countersService from '../../services/countersService';
import {CacheTableDisplay} from '@app/CacheManagers/CacheTableDisplay';

const CacheManagers = () => {
  const [cm, setCacheManager] = useState<undefined | CacheManager>(undefined);
  const [activeTabKey, setActiveTabKey] = useState(0);
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
      return <EmptyTasks/>;
    }
    return <TasksGrid/>;
  };

  const EmptyTasks = () => {
    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={CubesIcon}/>
        <Title headingLevel="h5" size="lg">
          Empty
        </Title>
        <EmptyStateBody>There are no tasks</EmptyStateBody>
      </EmptyState>
    );
  };

  const TasksGrid = () => {
    return (
      <Grid gutter="sm" style={{paddingTop: 40}}>
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
                    <VolumeIcon style={{color: chart_color_blue_400.value}}/>
                  ) : (
                    <RegistryIcon/>
                  )}
                </Tooltip>
                <strong style={{color: chart_color_blue_400.value}}>
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
      return <EmptyCounters/>;
    }
    return <CountersGrid/>;
  };

  const CountersGrid = () => {
    return (
      <Grid gutter="sm" style={{paddingTop: 40}}>
        {counters.map(counter => (
          <GridItem key={counter.name} span={4}>
            <Card id={'id-counter-' + counter.name}>
              <CardHeader id={'counter-id-header-' + counter.name}>
                <strong style={{color: chart_color_blue_400.value}}>
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
        <EmptyStateIcon icon={CubesIcon}/>
        <Title headingLevel="h5" size="lg">
          Empty
        </Title>
        <EmptyStateBody>There are no counters</EmptyStateBody>
      </EmptyState>
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
          <CacheTableDisplay caches={caches} cacheManager={cm}/>
        </Tab>
        <Tab eventKey={1} title={counters.length + ' Counters'}>
          <CountersContent/>
        </Tab>
        <Tab eventKey={2} title={tasks.length + ' Tasks'}>
          <TasksContent/>
        </Tab>
      </Tabs>
    );
  };

  const DisplayCacheManager = () => {
    if (cm === undefined) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon}/>
          <Title headingLevel="h5" size="lg">
            Data container
          </Title>
          <EmptyStateBody>The data container is empty</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <DisplayTabs/>
    );
  };

  const DisplayStatusIcon = (props: { status: string }) => {
    let icon;
    switch (props.status) {
      case 'STOPPING':
        icon = <OffIcon/>;
        break;
      case 'RUNNING':
        icon = <OkIcon/>;
        break;
      case 'INSTANTIATED':
        icon = <OkIcon/>;
        break;
      case 'INITIALIZING':
        icon = <InProgressIcon/>
        break;
      case 'FAILED':
        icon = <ErrorCircleOIcon/>
        break;
      case 'TERMINATED':
        icon = <OffIcon/>;
        break;
      default:
        icon = <OkIcon/>;
    }

    return (
      icon
    );
  };


  let title = 'Data container is empty';
  let status = '';
  if (cm !== undefined) {
    title = displayUtils.capitalize(cm.name);
    status = cm.cache_manager_status;
  }
  return (
    <PageSection>
      <Toolbar style={{paddingBottom: 20}}>
        <ToolbarGroup>
          <ToolbarItem><TextContent><Text component={TextVariants.h1}>{title}</Text></TextContent></ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem> <TextContent><Text component={TextVariants.h3} style={{
            paddingRight: 10,
            color: displayUtils.statusColor(status)
          }}><DisplayStatusIcon
            status={status}/></Text></TextContent></ToolbarItem>
          <ToolbarItem>
            <TextContent><Text component={TextVariants.h3}
                               style={{color: displayUtils.statusColor(status)}}>{displayUtils.capitalize(status)}</Text></TextContent>
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
      <DisplayCacheManager/>
    </PageSection>
  );
};

export {CacheManagers};
