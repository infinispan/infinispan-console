import * as React from 'react';
import {useEffect, useState} from 'react';
import dataContainerService from '../../services/dataContainerService';
import {
  Card,
  CardBody,
  DataToolbar,
  DataToolbarContent, DataToolbarGroup,
  DataToolbarItem,
  DataToolbarItemVariant,
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
import {CacheTableDisplay} from '@app/CacheManagers/CacheTableDisplay';
import {CounterTableDisplay} from '@app/CacheManagers/CounterTableDisplay';
import {TasksTableDisplay} from '@app/CacheManagers/TasksTableDisplay';
import {ProtobufSchemasDisplay} from "@app/CacheManagers/ProtobufSchemasDisplay";
import {Spinner} from '@patternfly/react-core/dist/js/experimental';
import {Status} from '@app/Common/Status';
import {global_spacer_sm} from '@patternfly/react-tokens';
import {useApiAlert} from '@app/utils/useApiAlert';
import {TableErrorState} from '@app/Common/TableErrorState';

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

  const buildTabs = () => {
    if (loading || error) {
      return <span />;
    }

    return (
      <Nav onSelect={handleTabClick}>
        <NavList variant={NavVariants.tertiary}>
          <NavItem key="nav-item-0" itemId="0" isActive={activeTabKey === '0'}>
            <strong>{cachesCount}</strong> Caches
          </NavItem>
          <NavItem key="nav-item-1" itemId="1" isActive={activeTabKey === '1'}>
            <strong>{countersCount}</strong> Counters
          </NavItem>
          <NavItem key="nav-item-2" itemId="2" isActive={activeTabKey === '2'}>
            <strong>{tasksCount}</strong> Tasks
          </NavItem>
          <NavItem key="nav-item-3" itemId="3" isActive={activeTabKey === '3'}>
            <strong>{protoSchemasCount}</strong> Protobuf Schemas
          </NavItem>
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
        <DataToolbarItem variant={DataToolbarItemVariant.separator}></DataToolbarItem>
        <DataToolbarItem variant={DataToolbarItemVariant.label}>
        Site:
        </DataToolbarItem>
        <DataToolbarItem variant={DataToolbarItemVariant.label}>
              {siteName}
        </DataToolbarItem>
        <DataToolbarItem variant={DataToolbarItemVariant.separator}></DataToolbarItem>
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
    let localSiteName = '';
    title = displayUtils.capitalize(cm.name);
    status = cm.cache_manager_status;

    return (
      <DataToolbar id="cluster-manager-header">
        <DataToolbarContent style={{ paddingLeft: 0}}>
            <DataToolbarItem>
              <TextContent>
                <Text component={TextVariants.h1} style={{marginBottom: 0}}>
                  {title}
                </Text>
              </TextContent>
            </DataToolbarItem>
           {buildSiteDisplay(cm.local_site)}
          <DataToolbarItem>
            <Status status={status} />
          </DataToolbarItem>
        </DataToolbarContent>
      </DataToolbar>
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
