import * as React from 'react';
import { useEffect, useState } from 'react';
import dataContainerService from '../../services/dataContainerService';
import {
  Card,
  CardBody,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Nav,
  NavItem,
  NavList,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
  Spinner, ToolbarItemVariant
} from '@patternfly/react-core';
import displayUtils from '../../services/displayUtils';
import {CacheTableDisplay} from '@app/CacheManagers/CacheTableDisplay';
import {CounterTableDisplay} from '@app/CacheManagers/CounterTableDisplay';
import {TasksTableDisplay} from '@app/CacheManagers/TasksTableDisplay';
import {ProtobufSchemasDisplay} from "@app/CacheManagers/ProtobufSchemasDisplay";
import { Status } from '@app/Common/Status';
import { global_spacer_sm } from '@patternfly/react-tokens';
import { useApiAlert } from '@app/utils/useApiAlert';
import { TableErrorState } from '@app/Common/TableErrorState';

const CacheManagers = () => {
  const { addAlert } = useApiAlert();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [cmName, setCacheManagerName] = useState<undefined | string>();
  const [cm, setCacheManager] = useState<undefined | CacheManager>();
  const [activeTabKey, setActiveTabKey] = useState('0');
  const [cachesCount, setCachesCount] = useState<number>(0);
  const [countersCount, setCountersCount] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [protoSchemasCount, setProtoSchemasCount] = useState<number>(0);
  const [showCaches, setShowCaches] = useState(false);
  const [showCounters, setShowCounters] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showSerializationContext, setShowSerializationContext] = useState(false);

  useEffect(() => {
    dataContainerService.getDefaultCacheManager().then(eitherCm => {
      setLoading(false);
      if (eitherCm.isRight()) {
        const cmName = eitherCm.value.name;
        setCacheManagerName(cmName);
        setCacheManager(eitherCm.value);
        setShowCaches(true);
      } else {
        setError(eitherCm.value.message);
      }
    });
  }, []);

  const handleTabClick = nav => {
    let tabIndex = nav.itemId;
    setActiveTabKey(tabIndex);
    setShowCaches(tabIndex == '0');
    setShowCounters(tabIndex == '1');
    setShowTasks(tabIndex == '2');
    setShowSerializationContext(tabIndex == '3');
  };

  interface ContainerTab {
    key: string;
    name: string;
    count: number;
  }

  const buildTabs = () => {
    if (loading || error) {
      return '';
    }

    const tabs:ContainerTab[] = [
      {name: 'Caches', count: cachesCount, key: '0'},
      {name: 'Counters', count: countersCount, key: '1'},
      {name: 'Tasks', count: tasksCount, key: '2'},
      {name: 'Protobuf Schemas', count: protoSchemasCount, key : '3'}
    ];

    return (
      <Nav onSelect={handleTabClick} variant={'tertiary'}>
        <NavList>
        {tabs.map(tab =>
          <NavItem key={'nav-item-' + tab.key} itemId={tab.key} isActive={activeTabKey === tab.key}>
            <strong style={{marginRight: global_spacer_sm.value}}>{tab.count}</strong> {tab.name}
          </NavItem>
        )}
        </NavList>
      </Nav>
    );
  };

  const buildSelectedContent = () => {
    if (loading) {
      return (
        <Card>
          <CardBody>
            <Spinner size="xl" />
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardBody>
            <TableErrorState error={error} />
          </CardBody>
        </Card>
      );
    }

    return (
      <Card>
        <CardBody>
          {cmName && (
            <CacheTableDisplay
              cmName={cmName}
              setCachesCount={setCachesCount}
              isVisible={showCaches}
            />
          )}
          {cmName && (
            <CounterTableDisplay
              setCountersCount={setCountersCount}
              isVisible={showCounters}
            />
          )}
          {cmName && (
            <TasksTableDisplay
              setTasksCount={setTasksCount}
              isVisible={showTasks}
            />
          )}
          {cmName && (
            <ProtobufSchemasDisplay
              setProtoSchemasCount={setProtoSchemasCount}
              isVisible={showSerializationContext}
            />
          )}
        </CardBody>
      </Card>
    );
  };

  const buildSiteDisplay = (siteName: string | undefined) => {
    if(!siteName || siteName == '') {
      return '';
    }

    return (
      <React.Fragment>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
        <ToolbarItem variant={ToolbarItemVariant.label}>
        Site:
        </ToolbarItem>
        <ToolbarItem variant={ToolbarItemVariant.label}>
              {siteName}
        </ToolbarItem>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
      </React.Fragment>
    );
  }

  const buildHeader = () => {
    let title = 'Data container';
    if (!cm) {
      return (
        <TextContent id="cluster-manager-header">
          <Text component={TextVariants.h1}>{title}</Text>
        </TextContent>
      );
    }

    let status = '';
    title = displayUtils.capitalize(cm.name);
    status = cm.cache_manager_status;

    return (
      <Toolbar id="cluster-manager-header">
        <ToolbarContent style={{ paddingLeft: 0}}>
          <ToolbarItem>
            <TextContent>
              <Text component={TextVariants.h1} style={{marginBottom: 0}}>
                {title}
              </Text>
            </TextContent>
          </ToolbarItem>
          {buildSiteDisplay(cm.local_site)}
          <ToolbarItem>
            <Status status={status} />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        {buildHeader()}
        {buildTabs()}
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>
        {buildSelectedContent()}
      </PageSection>
    </React.Fragment>
  );
};

export { CacheManagers };
