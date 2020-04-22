import * as React from 'react';
import {useEffect, useState} from 'react';
import dataContainerService from '../../services/dataContainerService';
import {
  Card,
  CardBody,
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
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import {
  CubesIcon,
  ErrorCircleOIcon,
  InProgressIcon,
  OffIcon,
  OkIcon,
  OutlinedQuestionCircleIcon
} from '@patternfly/react-icons';
import displayUtils from '../../services/displayUtils';
import tasksService from '../../services/tasksService';
import countersService from '../../services/countersService';
import {CacheTableDisplay} from '@app/CacheManagers/CacheTableDisplay';
import {CounterTableDisplay} from '@app/CacheManagers/CounterTableDisplay';
import {TasksTableDisplay} from '@app/CacheManagers/TasksTableDisplay';
import {Spinner} from "@patternfly/react-core/dist/js/experimental";

const CacheManagers = () => {
  const [cm, setCacheManager] = useState<undefined | CacheManager>(undefined);
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCaches, setShowCaches] = useState(false);
  const [showCounters, setShowCounters] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  // TODO REFACTOR
  useEffect(() => {
    dataContainerService.getCacheManagers().then(cacheManagers => {
        setCacheManager(cacheManagers[0]);
        dataContainerService.getCaches(cacheManagers[0].name).then(caches => {
            setCaches(caches);
            setShowCaches(true);
        });
    });
  }, []);

  useEffect(() => {
    tasksService.getTasks().then(tasks => setTasks(tasks));
  }, []);

  useEffect(() => {
    countersService.getCounters().then(counters => setCounters(counters));
  }, []);

  const handleTabClick = (nav) => {
    let tabIndex = nav.itemId;
    setActiveTabKey(tabIndex);
    setShowCaches(tabIndex == '0');
    setShowCounters(tabIndex == '1');
    setShowTasks(tabIndex == '2');
  };

  const DisplayCacheManagerTabs = () => {
    return (
      <Nav onSelect={handleTabClick}>
        <NavList variant={NavVariants.tertiary}>
          <NavItem key="nav-item-0" itemId="0" isActive={activeTabKey === '0'}>
            <strong>{caches.length}</strong> Caches
          </NavItem>
          <NavItem key="nav-item-1" itemId="1" isActive={activeTabKey === '1'}>
            <strong>{counters.length}</strong> Counters
          </NavItem>
          <NavItem key="nav-item-2" itemId="2" isActive={activeTabKey === '2'}>
            <strong>{tasks.length}</strong> Tasks
          </NavItem>
        </NavList>
      </Nav>
    );
  };

  const DisplayCacheManagerSelectedContent = () => {
    if (!cm) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon} />
          <Title headingLevel="h5" size="lg">
            Data container
          </Title>
          <EmptyStateBody>The data container is empty</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <Card>
        <CardBody>
          {!showCaches && !showCounters && !showTasks && cm && <Spinner size="xl"/>}
          {showCaches && cm && <CacheTableDisplay caches={caches} cacheManager={cm}/>}
          {showCounters && cm && <CounterTableDisplay counters={counters} cacheManager={cm} />}
          {showTasks && cm && <TasksTableDisplay tasks={tasks} cacheManager={cm} />}
        </CardBody>
      </Card>
    );
  };

  const DisplayStatusIcon = (props: { status: string }) => {
    let icon;
    switch (props.status) {
      case 'STOPPING':
        icon = <OffIcon />;
        break;
      case 'RUNNING':
        icon = <OkIcon />;
        break;
      case 'INSTANTIATED':
        icon = <OkIcon />;
        break;
      case 'INITIALIZING':
        icon = <InProgressIcon />;
        break;
      case 'FAILED':
        icon = <ErrorCircleOIcon />;
        break;
      case 'TERMINATED':
        icon = <OffIcon />;
        break;
      default:
        icon = <OkIcon />;
    }

    return icon;
  };

  let title = 'Data container is empty';
  let status = '';
  let localSiteName = '';
  if (cm !== undefined) {
    title = displayUtils.capitalize(cm.name);
    status = cm.cache_manager_status;
    localSiteName = cm.local_site ? '| Site ' + cm.local_site : '';
  }

  const DisplayCacheManagerHeader = () => {
    if (!cm) {
      return (
        <TextContent>
          <Text component={TextVariants.h1}>
            Data container
          </Text>
        </TextContent>
      );
    }

    return (
      <React.Fragment>
        <TextContent>
          <Text component={TextVariants.h1}>
            Data container - {title}
            <Tooltip
              position={TooltipPosition.top}
              content={<div>Data container name</div>}
            >
              <OutlinedQuestionCircleIcon style={{ paddingLeft: 10 }} />
            </Tooltip>
          </Text>
        </TextContent>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem>
              <TextContent>
                <Text
                  component={TextVariants.h3}
                  style={{
                    paddingRight: 10,
                    color: displayUtils.statusColor(status, true)
                  }}
                >
                  <DisplayStatusIcon status={status} />
                </Text>
              </TextContent>
            </ToolbarItem>
            <ToolbarItem>
              <TextContent>
                <Text
                  component={TextVariants.h3}
                  style={{
                    paddingRight: 10,
                    fontWeight: 'bolder',
                    color: displayUtils.statusColor(status, false)
                  }}
                >
                  {displayUtils.capitalize(status)}
                </Text>
              </TextContent>
            </ToolbarItem>
            <ToolbarItem>
              <TextContent>
                <Text component={TextVariants.h3}>{localSiteName}</Text>
              </TextContent>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
      </React.Fragment>
    );
  };
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DisplayCacheManagerHeader />
      </PageSection>
      <PageSection variant={PageSectionVariants.light}>
        <DisplayCacheManagerTabs />
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        <DisplayCacheManagerSelectedContent/>
      </PageSection>
    </React.Fragment>
  );
};

export { CacheManagers };
