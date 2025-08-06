import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  DescriptionList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Grid,
  GridItem,
  Spinner
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { QueryMetrics } from '@app/Caches/Query/QueryMetrics';
import { DataDistributionChart } from './DataDistributionChart';
import { useTranslation } from 'react-i18next';
import { StorageType } from '@services/infinispanRefData';
import { DataAccess } from './DataAccess';
import { useCacheDetail } from '@app/services/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { Link } from 'react-router-dom';
import { MultiContentCard } from '@patternfly/react-component-groups';
import { MetricDescriptionListGroup } from '@app/Caches/Metrics/MetricDescriptionListGroup';

const CacheMetrics = (props: { cacheName: string; display: boolean }) => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { cache, error, loading } = useCacheDetail();
  const [stats, setStats] = useState<CacheStats | undefined>(cache.stats);
  const [displayQueryStats, setDisplayQueryStats] = useState<boolean>(cache.queryable!);
  const [displayDataDistribution, setDisplayDataDistribution] = useState<boolean>(
    ConsoleServices.security().hasConsoleACL(ConsoleACL.MONITOR, connectedUser)
  );
  const memory = () => {
    if (cache.memory) {
      return cache.memory.storage_type == 'OFF_HEAP' ? StorageType.OFF_HEAP : StorageType.HEAP;
    }
    return StorageType.HEAP;
  };

  const buildOperationsPerformanceCard = () => {
    return (
      <Card isPlain isFullHeight>
        <CardTitle>{t('caches.cache-metrics.performance-title')}</CardTitle>
        <CardBody>
          <DescriptionList isHorizontal isCompact>
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.average-reads"
              metricValue={stats?.average_read_time}
              ariaLabel="average-cache-read-time"
            />
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.average-writes"
              metricValue={stats?.average_write_time}
              ariaLabel="average-cache-write-time"
            />
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.average-deletes"
              metricValue={stats?.average_remove_time}
              ariaLabel="average-cache-delete-time"
            />
          </DescriptionList>
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
    return (
      <Card isPlain isFullHeight>
        <CardTitle>{t('caches.cache-metrics.entries-title')}</CardTitle>
        <CardBody>
          <DescriptionList isHorizontal isCompact>
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.approximate-unique-entries"
              metricValue={stats?.approximate_entries_unique}
              ariaLabel="view-cache-approximate-unique-entries"
              dataCy={'aUniqueEntries'}
            />
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.approximate-entries-in-memory"
              metricValue={stats?.approximate_entries_in_memory}
              ariaLabel="view-cache-approximate-entries-in-memory"
              dataCy={'aEntriesInMemory'}
            />
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.approximate-entries"
              metricValue={stats?.approximate_entries_in_memory}
              ariaLabel="view-cache-approximate-entries"
              dataCy={'aEntries'}
            />
          </DescriptionList>
        </CardBody>
      </Card>
    );
  };

  const buildLifecycleCard = () => {
    return (
      <Card isPlain isFullHeight>
        <CardTitle>{t('caches.cache-metrics.cache-lifecycle-title')}</CardTitle>
        <CardBody>
          <DescriptionList isHorizontal isCompact>
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.cache-started-since"
              metricValue={stats?.time_since_start}
              ariaLabel="view-cache-started-since"
              dataCy="cacheStartedSince"
            />
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.cache-reset-since"
              metricValue={stats?.time_since_reset}
              ariaLabel="view-cache-reset-since"
              dataCy="cacheResetSince"
            />
          </DescriptionList>
        </CardBody>
      </Card>
    );
  };

  const buildMemoryCard = () => {
    let content;
    if (memory() === StorageType.OFF_HEAP) {
      content = (
        <MetricDescriptionListGroup
          metricName="caches.cache-metrics.cache-size-off-heap"
          metricValue={stats?.off_heap_memory_used}
          ariaLabel="view-cache-metrics-off-heap"
          dataCy="memoryOffHeap"
        />
      );
    } else {
      content = (
        <MetricDescriptionListGroup
          metricName="caches.cache-metrics.cache-size-heap"
          metricValue={stats?.data_memory_used}
          ariaLabel="view-cache-metrics-heap"
          dataCy="memoryHeap"
        />
      );
    }

    return (
      <Card isPlain isFullHeight>
        <CardTitle>{t('caches.cache-metrics.memory-title')}</CardTitle>
        <CardBody>
          <DescriptionList isHorizontal isCompact>
            {content}
            <MetricDescriptionListGroup
              metricName="caches.cache-metrics.min-nodes"
              metricValue={stats?.required_minimum_number_of_nodes}
              ariaLabel="view-cache-metrics-nodes"
              dataCy="minNodes"
            />
          </DescriptionList>
        </CardBody>
      </Card>
    );
  };

  if (!props.display) {
    return <></>;
  }

  if (loading && error.length == 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState icon={Spinner} titleText={t('common.loading')} headingLevel="h4"></EmptyState>
        </CardBody>
      </Card>
    );
  }

  if (error.length > 0) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            variant={EmptyStateVariant.sm}
            status={'warning'}
            titleText={t('caches.cache-metrics.load-error')}
            headingLevel="h2"
          >
            <EmptyStateBody>{error}</EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Link
                  to={{
                    pathname: '/',
                    search: location.search
                  }}
                >
                  <Button variant={ButtonVariant.secondary}>{t('common.actions.back')}</Button>
                </Link>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  if (stats && !stats.enabled) {
    return (
      <EmptyState
        variant={EmptyStateVariant.sm}
        icon={CubesIcon}
        headingLevel="h5"
        status={'info'}
        titleText={t('caches.cache-metrics.metrics-title')}
      >
        <EmptyStateBody>
          <Content component={ContentVariants.p}>{t('caches.cache-metrics.metrics-disabled')}</Content>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        <Grid hasGutter={true}>
          <GridItem span={12}>
            {stats && <MultiContentCard withDividers cards={[buildEntriesCard(), buildMemoryCard()]} />}
          </GridItem>
          <GridItem span={12}>
            {stats && (
              <MultiContentCard withDividers cards={[buildLifecycleCard(), buildOperationsPerformanceCard()]} />
            )}
          </GridItem>
          <GridItem span={5}>
            <DataAccess cacheName={props.cacheName} stats={stats!} />
          </GridItem>
          {displayDataDistribution && <GridItem span={7}> {buildDataDistribution()}</GridItem>}
          <GridItem span={displayDataDistribution ? 12 : 7}>{buildQueryStats()}</GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

export { CacheMetrics };
