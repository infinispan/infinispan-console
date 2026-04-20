import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Flex,
  FlexItem,
  Icon,
  PageSection,
  PageSectionVariants,
  Spinner,
  Tab,
  Tabs,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { CacheTableDisplay } from '@app/CacheManagers/CacheTableDisplay';
import { CounterTableDisplay } from '@app/CacheManagers/CounterTableDisplay';
import { TasksTableDisplay } from '@app/CacheManagers/TasksTableDisplay';
import { ProtobufSchemasDisplay } from '@app/ProtoSchema/ProtobufSchemasDisplay';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';

import { t_global_spacer_md } from '@patternfly/react-tokens';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useDataContainer } from '@app/hooks/dataContainerHooks';
import { useTranslation } from 'react-i18next';
import { useConnectedUser } from '@app/hooks/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { RebalancingCacheManager } from '@app/Rebalancing/RebalancingCacheManager';
import { ClusterIcon, RedoIcon } from '@patternfly/react-icons';
import { TracingEnabled } from '@app/Common/TracingEnabled';
import { PageHeader } from '@patternfly/react-component-groups';

const PATH_TAB_MAP: Record<string, string> = {
  '/caches': '0',
  '/counters': '1',
  '/tasks': '2',
  '/schemas': '3',
};

const TAB_PATH_MAP: Record<string, string> = {
  '0': '/caches',
  '1': '/counters',
  '2': '/tasks',
  '3': '/schemas',
};

const CacheManagers = () => {
  const { connectedUser } = useConnectedUser();
  const { cm, loading, error, reload } = useDataContainer();
  const location = useLocation();
  const initialTab = PATH_TAB_MAP[location.pathname] || '0';
  const [activeTabKey, setActiveTabKey] = useState(initialTab);
  const [cachesCount, setCachesCount] = useState<number>(0);
  const [countersCount, setCountersCount] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [protoSchemasCount, setProtoSchemasCount] = useState<number>(0);
  const [showCaches, setShowCaches] = useState(initialTab === '0');
  const [showCounters, setShowCounters] = useState(initialTab === '1');
  const [showTasks, setShowTasks] = useState(initialTab === '2');
  const [showSerializationContext, setShowSerializationContext] = useState(
    initialTab === '3',
  );
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = PATH_TAB_MAP[location.pathname] || '0';
    setActiveTabKey(tab);
    setShowCaches(tab === '0');
    setShowCounters(tab === '1');
    setShowTasks(tab === '2');
    setShowSerializationContext(tab === '3');
  }, [location.pathname]);

  const handleTabClick = (index) => {
    setActiveTabKey(index);
    setShowCaches(index == '0');
    setShowCounters(index == '1');
    setShowTasks(index == '2');
    setShowSerializationContext(index == '3');
    navigate(TAB_PATH_MAP[index] || '/', { replace: true });
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

    const tabs: ContainerTab[] = [
      { name: t('cache-managers.caches-tab'), count: cachesCount, key: '0' },
      {
        name: t('cache-managers.counters-tab'),
        count: countersCount,
        key: '1',
      },
    ];

    if (
      ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)
    ) {
      tabs.push({
        name: t('cache-managers.tasks-tab'),
        count: tasksCount,
        key: '2',
      });
    }

    if (
      ConsoleServices.security().hasConsoleACL(
        ConsoleACL.BULK_READ,
        connectedUser,
      )
    ) {
      tabs.push({
        name: t('cache-managers.schemas-tab'),
        count: protoSchemasCount,
        key: '3',
      });
    }

    return (
      <Tabs
        data-cy="navigationTabs"
        onSelect={(_event, tab) => handleTabClick(tab)}
        style={{ marginTop: t_global_spacer_md.value }}
        activeKey={activeTabKey}
      >
        {tabs.map((tab) => (
          <Tab
            data-cy={'tab-' + tab.name}
            aria-label={'nav-item-' + tab.name}
            key={'nav-item-' + tab.key}
            eventKey={tab.key}
            title={<TabTitleText>{tab.count + ' ' + tab.name}</TabTitleText>}
          ></Tab>
        ))}
      </Tabs>
    );

    return (
      <Tabs
        data-cy="navigationTabs"
        onSelect={(_event, tab) => handleTabClick(tab)}
        style={{ marginTop: t_global_spacer_md.value }}
        activeKey={activeTabKey}
        role={'region'}
      >
        {tabs.map((tab) => (
          <Tab
            data-cy={`tab-${tab.name}`}
            aria-label={`nav-item-${tab.name}`}
            key={`nav-item-${tab.key}`}
            eventKey={tab.key}
            title={<TabTitleText>{tab.count + ' ' + tab.name}</TabTitleText>}
          ></Tab>
        ))}
      </Tabs>
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
      <React.Fragment>
        {cm && (
          <CacheTableDisplay
            setCachesCount={setCachesCount}
            isVisible={showCaches}
          />
        )}
        {cm && (
          <CounterTableDisplay
            setCountersCount={setCountersCount}
            isVisible={showCounters}
          />
        )}
        {cm &&
          ConsoleServices.security().hasConsoleACL(
            ConsoleACL.ADMIN,
            connectedUser,
          ) && (
            <TasksTableDisplay
              setTasksCount={setTasksCount}
              isVisible={showTasks}
            />
          )}
        {cm && (
          <ProtobufSchemasDisplay
            setProtoSchemasCount={setProtoSchemasCount}
            isVisible={showSerializationContext}
          />
        )}
      </React.Fragment>
    );
  };

  const buildHeader = () => {
    const title = t('cache-managers.title');
    if (!cm) {
      return <PageHeader title={title} subtitle={''} />;
    }

    return (
      <>
        <PageHeader
          ouiaId="cluster-manager-header"
          title={title}
          subtitle={''}
        />
        <PageSection>
          <Toolbar id="cluster-manager-sub-header">
            <ToolbarContent>
              {cm.local_site != null && cm.local_site !== '' && (
                <>
                  <ToolbarItem>
                    <Flex data-cy="localSite">
                      <FlexItem spacer={{ default: 'spacerXs' }}>
                        <Icon>
                          <ClusterIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>{cm.local_site}</FlexItem>
                    </Flex>
                  </ToolbarItem>
                  <ToolbarItem variant="separator"></ToolbarItem>
                </>
              )}
              <ToolbarItem>
                <InfinispanComponentStatus
                  name="clusterManager"
                  status={cm.cache_manager_status}
                />
              </ToolbarItem>
              {cm.tracing_enabled && (
                <React.Fragment>
                  <ToolbarItem variant="separator"></ToolbarItem>
                  <ToolbarItem>
                    <TracingEnabled enabled={cm.tracing_enabled} />
                  </ToolbarItem>
                </React.Fragment>
              )}
              <ToolbarItem variant="separator"></ToolbarItem>
              <ToolbarItem>
                <RebalancingCacheManager />
              </ToolbarItem>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Button
                  variant="link"
                  data-cy="refreshCacheContainer"
                  icon={<RedoIcon />}
                  onClick={() => reload()}
                >
                  {t('common.actions.refresh')}
                </Button>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          {buildTabs()}
        </PageSection>
      </>
    );
  };

  return (
    <React.Fragment>
      {buildHeader()}
      <PageSection variant={PageSectionVariants.default}>
        {buildSelectedContent()}
      </PageSection>
    </React.Fragment>
  );
};

export { CacheManagers };
