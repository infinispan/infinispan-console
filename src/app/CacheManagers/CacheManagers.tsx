import * as React from 'react';
import {useEffect, useState} from 'react';
import dataContainerService from '../../services/dataContainerService';
import {
  Alert,
  AlertVariant,
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
import displayUtils from '../../services/displayUtils';
import tasksService from '../../services/tasksService';
import countersService from '../../services/countersService';
import {CacheTableDisplay} from '@app/CacheManagers/CacheTableDisplay';
import {CounterTableDisplay} from '@app/CacheManagers/CounterTableDisplay';
import {TasksTableDisplay} from '@app/CacheManagers/TasksTableDisplay';
import {Spinner} from "@patternfly/react-core/dist/js/experimental";
import {Status} from "@app/Common/Status";
import {global_spacer_sm} from "@patternfly/react-tokens";

const CacheManagers = () => {
  const [error, setError] = useState<undefined | string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [cmName, setCacheManagerName] = useState<undefined | string>();
  const [cm, setCacheManager] = useState<undefined | CacheManager>();
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCaches, setShowCaches] = useState(false);
  const [showCounters, setShowCounters] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  useEffect(() => {
    dataContainerService.getDefaultCacheManager().then(eitherCm => {
      if(eitherCm.isRight()) {
        const cmName = eitherCm.value.name;
        setCacheManagerName(cmName);
        setCacheManager(eitherCm.value);
        dataContainerService.getCaches(cmName).then(eitherCaches => {
          setLoading(false);
          if(eitherCaches.isRight()) {
            setCaches(eitherCaches.value);
            setShowCaches(true);
          } else {
            setError(eitherCaches.value.message);
          }
        });
        tasksService.getTasks().then(tasks => setTasks(tasks));
        countersService.getCounters().then(counters => setCounters(counters));
      } else {
        setLoading(false);
        setError(eitherCm.value.message);
      }
    });
  }, []);

  const handleTabClick = (nav) => {
    let tabIndex = nav.itemId;
    setActiveTabKey(tabIndex);
    setShowCaches(tabIndex == '0');
    setShowCounters(tabIndex == '1');
    setShowTasks(tabIndex == '2');
  };

  const CacheManagerTabs = () => {
    if(loading || error) {
      return <span/>;
    }

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
    return (
      <Card>
        <CardBody>
          {!loading && error && <Alert title={error} variant={AlertVariant.danger} isInline />}
          {loading && <Spinner size="xl"/>}
          {showCaches && cmName && !error && <CacheTableDisplay caches={caches} cmName={cmName}/>}
          {showCounters && cmName && !error && <CounterTableDisplay counters={counters} />}
          {showTasks && cmName && !error && <TasksTableDisplay tasks={tasks} />}
        </CardBody>
      </Card>
    );
  };

  let title = 'Data container is empty';
  let status = '';
  let localSiteName = '';
  if (cm !== undefined) {
    title = displayUtils.capitalize(cm.name);
    status = cm.cache_manager_status;
    localSiteName = cm.local_site ?  '| ' + cm.local_site + ' site' : '';
  }

  const DisplayCacheManagerHeader = () => {
    if (!cm) {
      return (
        <TextContent id="cluster-manager-header">
          <Text component={TextVariants.h1}>
            Data container
          </Text>
        </TextContent>
      );
    }
    return (
      <React.Fragment>
        <DataToolbar id="cluster-manager-header">
          <DataToolbarContent style={{paddingLeft:0}}>
            <DataToolbarItem>
              <TextContent>
                <Text component={TextVariants.h1}>{title} {localSiteName}</Text>
              </TextContent>
            </DataToolbarItem>
            <DataToolbarItem style={{marginBottom:global_spacer_sm.value}}><Status status={status} /></DataToolbarItem>
            {/*<DataToolbarItem variant="separator"></DataToolbarItem>*/}
          </DataToolbarContent>
        </DataToolbar>
        <CacheManagerTabs/>
      </React.Fragment>
    );
  };
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DisplayCacheManagerHeader />
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        <DisplayCacheManagerSelectedContent/>
      </PageSection>
    </React.Fragment>
  );
};

export { CacheManagers };
