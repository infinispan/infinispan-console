import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Spinner,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { CubesIcon } from '@patternfly/react-icons';
import { QueryMetrics } from '@app/Caches/Query/QueryMetrics';
import { DataDistributionChart } from './DataDistributionChart';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { useTranslation } from 'react-i18next';
import { StorageType } from '@services/infinispanRefData';
import { DataAccess } from './DataAccess';
import { useCacheDetail } from '@app/services/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { CacheLifecycle } from '@app/Caches/CacheLifecycle';

const CacheMetrics = (props: { cacheName: string; display: boolean }) => {
  const { connectedUser } = useConnectedUser();
  const { cache, error, loading } = useCacheDetail();
  const [stats, setStats] = useState<CacheStats | undefined>(cache.stats);
  const [displayQueryStats, setDisplayQueryStats] = useState<boolean>(false);
  const [displayDataDistribution, setDisplayDataDistribution] = useState<boolean>(false);
  const [memory, setMemory] = useState<string | undefined>(undefined);
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  useEffect(() => {
    if (ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      // Data distribution is for admin only
      setDisplayDataDistribution(true);
      const loadMemory = cache.memory;
      if (loadMemory) {
        setMemory(loadMemory.storage_type == 'OFF_HEAP' ? StorageType.OFF_HEAP : StorageType.HEAP);
      } else {
        setMemory(StorageType.HEAP);
      }
    }

    setStats(cache.stats);
    setDisplayQueryStats(cache.queryable);
  }, [cache, error]);

  const buildOperationsPerformanceCard = () => {
    if (!stats) {
      return '';
    }

    return (
      <Card>
        <CardTitle>{t('caches.cache-metrics.performance-title')}</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt} aria-label="average-cache-read-time">
                {displayUtils.formatNumber(stats.average_read_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name="average-reads"
                  label={t('caches.cache-metrics.average-reads')}
                  content={t('caches.cache-metrics.average-reads-tooltip')}
                  text={t('caches.cache-metrics.average-reads')}
                />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt} aria-label="average-cache-write-time">
                {displayUtils.formatNumber(stats.average_write_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name="average-writes"
                  label={t('caches.cache-metrics.average-writes')}
                  content={t('caches.cache-metrics.average-writes-tooltip')}
                  text={t('caches.cache-metrics.average-writes')}
                />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt} aria-label="average-cache-delete-time">
                {displayUtils.formatNumber(stats.average_remove_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name="average-deletes"
                  label={t('caches.cache-metrics.average-deletes')}
                  content={t('caches.cache-metrics.average-deletes-tooltip')}
                  text={t('caches.cache-metrics.average-deletes')}
                />
              </TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const buildQueryStats = () => {
    if (!displayQueryStats) {
      return;
    }
    return <QueryMetrics cacheName={props.cacheName} />;
  };

  const buildDataDistribution = () => {
    if (!displayDataDistribution) {
      return;
    }
    return <DataDistributionChart cacheName={props.cacheName} />;
  };

  const buildEntriesCard = () => {
    if (!stats) {
      return '';
    }

    return (
      <Card>
        <CardTitle>{t('caches.cache-metrics.entries-title')}</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem aria-label="view-cache-approximate-unique-entries" component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.approximate_entries_unique)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name="approximate-unique-entries"
                  label={t('caches.cache-metrics.approximate-unique-entries')}
                  content={t('caches.cache-metrics.approximate-unique-entries-tooltip')}
                  text={t('caches.cache-metrics.approximate-unique-entries')}
                />
              </TextListItem>
              <TextListItem aria-label="view-cache-approximate-entries-in-memory" component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.approximate_entries_in_memory)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name="min-nodes"
                  label={t('caches.cache-metrics.approximate-entries-in-memory')}
                  content={t('caches.cache-metrics.approximate-entries-in-memory-tooltip')}
                  text={t('caches.cache-metrics.approximate-entries-in-memory')}
                />
              </TextListItem>
              <TextListItem aria-label="view-cache-approximate-entries" component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.approximate_entries)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name="approximate-unique-entries"
                  label={t('caches.cache-metrics.approximate-entries')}
                  content={t('caches.cache-metrics.approximate-entries-tooltip')}
                  text={t('caches.cache-metrics.approximate-entries')}
                />
              </TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const buildMemoryCard = () => {
    if (!stats) {
      return '';
    }
    let content;
    if (memory === StorageType.OFF_HEAP) {
      content = (
        <React.Fragment>
          <TextListItem aria-label="view-cache-metrics-off-heap" component={TextListItemVariants.dt}>
            {displayUtils.formatNumber(stats.off_heap_memory_used)}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <PopoverHelp
              name="cache-size-off-heap"
              label={t('caches.cache-metrics.cache-size-off-heap')}
              content={t('caches.cache-metrics.cache-size-off-heap-tooltip')}
              text={t('caches.cache-metrics.cache-size-off-heap')}
            />
          </TextListItem>
        </React.Fragment>
      );
    } else {
      content = (
        <React.Fragment>
          <TextListItem aria-label="view-cache-metrics-heap" component={TextListItemVariants.dt}>
            {displayUtils.formatNumber(stats.data_memory_used)}
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <PopoverHelp
              name="cache-size-heap"
              label={t('caches.cache-metrics.cache-size-heap')}
              content={t('caches.cache-metrics.cache-size-heap-tooltip')}
              text={t('caches.cache-metrics.cache-size-heap')}
            />
          </TextListItem>
        </React.Fragment>
      );
    }

    return (
      <Card>
        <CardTitle>{t('caches.cache-metrics.memory-title')}</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              {content}
              <TextListItem aria-label="view-cache-metrics-nodes" component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.required_minimum_number_of_nodes)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name="min-nodes"
                  label={t('caches.cache-metrics.min-nodes')}
                  content={t('caches.cache-metrics.min-nodes-tooltip')}
                  text={t('caches.cache-metrics.min-nodes')}
                />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}></TextListItem>
              <TextListItem component={TextListItemVariants.dd}>_</TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  if (!props.display) {
    return <span />;
  }

  if (!stats || loading) {
    return <Spinner size={'xl'} />;
  }

  if (!stats.enabled) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <EmptyStateHeader
          titleText={<>{t('caches.cache-metrics.metrics-title')}</>}
          icon={<EmptyStateIcon icon={CubesIcon} />}
          headingLevel="h5"
        />
        <EmptyStateBody>
          <TextContent>
            <Text component={TextVariants.p}>{t('caches.cache-metrics.metrics-disabled')}</Text>
          </TextContent>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Grid hasGutter={true}>
      <GridItem span={4}>{buildEntriesCard()}</GridItem>
      <GridItem span={4}>{buildMemoryCard()}</GridItem>
      <GridItem span={4}>{buildOperationsPerformanceCard()}</GridItem>
      {displayDataDistribution && <GridItem span={8}> {buildDataDistribution()}</GridItem>}
      <GridItem span={4}>
        <CacheLifecycle stats={stats} />
        <DataAccess cacheName={props.cacheName} stats={stats} />
      </GridItem>
      <GridItem span={displayDataDistribution ? 12 : 8}>{buildQueryStats()}</GridItem>
    </Grid>
  );
};

export { CacheMetrics };
