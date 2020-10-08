import * as React from 'react';
import { useEffect, useState } from 'react';
import dataContainerService from '@services/dataContainerService';
import {
  Card,
  CardBody,
  Divider,
  Flex,
  FlexItem,
  Nav,
  NavItem,
  NavList,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { CacheTableDisplay } from '@app/CacheManagers/CacheTableDisplay';
import { CounterTableDisplay } from '@app/CacheManagers/CounterTableDisplay';
import { TasksTableDisplay } from '@app/CacheManagers/TasksTableDisplay';
import { ProtobufSchemasDisplay } from '@app/ProtoSchema/ProtobufSchemasDisplay';
import { Status } from '@app/Common/Status';
import { global_spacer_md, global_spacer_sm } from '@patternfly/react-tokens';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';

const CacheManagers = () => {
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
  const [showSerializationContext, setShowSerializationContext] = useState(
    false
  );
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  useEffect(() => {
    if (loading) {
      dataContainerService
        .getDefaultCacheManager()
        .then((eitherCm) => {
          if (eitherCm.isRight()) {
            const cmName = eitherCm.value.name;
            setCacheManagerName(cmName);
            setCacheManager(eitherCm.value);
            setShowCaches(true);
          } else {
            setError(eitherCm.value.message);
          }
          setLoading(false);
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  const handleTabClick = (nav) => {
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

    const tabs: ContainerTab[] = [
      { name: t('cache-managers.caches-tab'), count: cachesCount, key: '0' },
      { name: t('cache-managers.counters-tab'), count: countersCount, key: '1' },
      { name: t('cache-managers.tasks-tab'), count: tasksCount, key: '2' },
      { name: t('cache-managers.schemas-tab'), count: protoSchemasCount, key: '3' },
    ];

    return (
      <Nav
        onSelect={handleTabClick}
        variant={'tertiary'}
        style={{ marginTop: global_spacer_md.value }}
      >
        <NavList>
          {tabs.map((tab) => (
            <NavItem
              key={'nav-item-' + tab.key}
              itemId={tab.key}
              isActive={activeTabKey === tab.key}
            >
              <strong style={{ marginRight: global_spacer_sm.value }}>
                {tab.count}
              </strong>{' '}
              {tab.name}
            </NavItem>
          ))}
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
    if (!siteName || siteName == '') {
      return '';
    }

    return (
      <React.Fragment>
        <Divider isVertical />
        <FlexItem>{'Site: ' + siteName}</FlexItem>
      </React.Fragment>
    );
  };

  const buildHeader = () => {
    let title = t('cache-managers.title');
    if (!cm) {
      return (
        <PageSection variant={PageSectionVariants.light}>
          <Flex id="cluster-manager-header">
            <FlexItem>
              <TextContent>
                <Text component={TextVariants.h1}>{title}</Text>
              </TextContent>
            </FlexItem>
          </Flex>
        </PageSection>
      );
    }

    let status = '';
    title = displayUtils.capitalize(cm.name);
    status = cm.cache_manager_status;

    return (
      <PageSection
        variant={PageSectionVariants.light}
        style={{ paddingBottom: 0 }}
      >
        <Flex id="cluster-manager-header" direction={{ default: 'column' }}>
          <Flex>
            <FlexItem>
              <TextContent>
                <Text component={TextVariants.h1}>{title}</Text>
              </TextContent>
            </FlexItem>
          </Flex>
          <Flex>
            <FlexItem>
              <Status status={status} />
            </FlexItem>
            {buildSiteDisplay(cm.local_site)}
          </Flex>
        </Flex>
        {buildTabs()}
      </PageSection>
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
