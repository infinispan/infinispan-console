import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { CubesIcon } from '@patternfly/react-icons';
import cacheService from '../../services/cacheService';
import { QueryMetrics } from '@app/Caches/Query/QueryMetrics';

const CacheMetrics = (props: { cacheName: string; display: boolean }) => {
  const [stats, setStats] = useState<CacheStats | undefined>(undefined);
  const [statsError, setStatsError] = useState<string | undefined>(undefined);
  const [displayQueryStats, setDisplayQueryStats] = useState<boolean>(false);
  const [queryStats, setQueryStats] = useState<QueryStats | undefined>();
  const [queryStatsLoading, setQueryStatsLoading] = useState<boolean>(true);
  const [queryStatsError, setQueryStatsError] = useState<string>('');

  useEffect(() => {
    cacheService.retrieveFullDetail(props.cacheName).then((detail) => {
      setQueryStatsLoading(false);
      if (detail.isRight()) {
        setStats(detail.value.stats);
        let loadQueryStats =
          detail.value.stats.enabled && detail.value.features.indexed;
        setDisplayQueryStats(loadQueryStats);
        if (loadQueryStats) {
          // Retrieve query stats only if stats are enabled and the cache is indexed
          cacheService
            .retrieveQueryStats(props.cacheName)
            .then((eitherStats) => {
              setQueryStatsLoading(false);
              if (eitherStats.isRight()) {
                setQueryStats(eitherStats.value);
              } else {
                setQueryStatsError(eitherStats.value.message);
              }
            });
        }
      } else {
        setStatsError(detail.value.message);
      }
    });
  }, [props.display]);

  const buildOperationsPerformanceCard = () => {
    if (!stats) {
      return '';
    }

    return (
      <Card>
        <CardTitle>Operations Performance</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_read_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Avg Reads
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_write_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Avg Writes
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_remove_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Avg Removes
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
    return (
      <QueryMetrics
        cacheName={props.cacheName}
        stats={queryStats}
        error={queryStatsError}
        loading={queryStatsLoading}
      />
    );
  };

  const buildCacheLoaderCard = () => {
    if (!stats) {
      return '';
    }

    let all =
      stats.hits +
      stats.retrievals +
      stats.remove_hits +
      stats.remove_misses +
      stats.stores +
      stats.misses +
      stats.evictions;

    return (
      <Card>
        <CardTitle>Data access</CardTitle>
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
                { x: 'Evictions', y: stats.evictions },
              ]}
              labels={({ datum }) =>
                `${datum.x}:${displayUtils.formatNumber(
                  (datum.y * 100) / all
                )}%`
              }
              legendData={[
                {
                  name: 'Hits: ' + displayUtils.formatNumber(stats.hits),
                },
                {
                  name: 'Misses: ' + displayUtils.formatNumber(stats.misses),
                },
                {
                  name:
                    'Retrievals: ' +
                    displayUtils.formatNumber(stats.retrievals),
                },
                {
                  name: 'Stores: ' + displayUtils.formatNumber(stats.stores),
                },
                {
                  name:
                    'Remove Hits: ' +
                    displayUtils.formatNumber(stats.remove_hits),
                },
                {
                  name:
                    'Remove Misses: ' +
                    displayUtils.formatNumber(stats.remove_misses),
                },
                {
                  name:
                    'Evictions: ' + displayUtils.formatNumber(stats.evictions),
                },
              ]}
              legendOrientation="vertical"
              legendPosition="right"
              padding={{
                bottom: 40,
                left: 80,
                right: 200, // Adjusted to accommodate legend
                top: 20,
              }}
              subTitle="Data access"
              title={'' + all}
              width={400}
              themeColor={ChartThemeColor.multiOrdered}
            />
          </div>
        </CardBody>
      </Card>
    );
  };

  const buildEntriesCard = () => {
    if (!stats) {
      return '';
    }

    return (
      <Card>
        <CardTitle>Entries</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.current_number_of_entries)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Current number
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.total_number_of_entries)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Total number
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>-</TextListItem>
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

    return (
      <Card>
        <CardTitle>Memory</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(
                  stats.current_number_of_entries_in_memory
                )}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Current number
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.data_memory_used)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Total in use
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>-</TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  if (!stats?.enabled) {
    const message = 'Statistics not enabled';

    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={CubesIcon} />
        <Title headingLevel="h5" size="lg">
          Statistics
        </Title>
        <EmptyStateBody>
          <TextContent>
            <Text component={TextVariants.p}>{message}</Text>
          </TextContent>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  if (!props.display) {
    return <span />;
  }

  return (
    <Grid hasGutter={true}>
      <GridItem span={4}>{buildEntriesCard()}</GridItem>
      <GridItem span={4}>{buildMemoryCard()}</GridItem>
      <GridItem span={4}>{buildOperationsPerformanceCard()}</GridItem>
      <GridItem span={6}>{buildCacheLoaderCard()}</GridItem>
      <GridItem span={6}>{buildQueryStats()}</GridItem>
    </Grid>
  );
};

export { CacheMetrics };
