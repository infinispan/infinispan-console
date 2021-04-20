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
import { QueryMetrics } from '@app/Caches/Query/QueryMetrics';
import {ConsoleServices} from "@services/ConsoleServices";

const CacheMetrics = (props: { cacheName: string; display: boolean }) => {
  const [stats, setStats] = useState<CacheStats | undefined>(undefined);
  const [statsError, setStatsError] = useState<string | undefined>(undefined);
  const [displayQueryStats, setDisplayQueryStats] = useState<boolean>(false);

  useEffect(() => {
    ConsoleServices.caches().retrieveFullDetail(props.cacheName).then((detail) => {
      if (detail.isRight()) {
        setStats(detail.value.stats);
        let loadQueryStats =
          detail.value.stats != undefined && detail.value.stats.enabled && detail.value.features.indexed;
        setDisplayQueryStats(loadQueryStats);
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
        <CardTitle>Operation performance values</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_read_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Average reads
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_write_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Average writes
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_remove_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Average removes
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
      <QueryMetrics cacheName={props.cacheName}/>
    );
  };

  const buildDataAccess = () => {
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
        <CardTitle>Data access statistics</CardTitle>
        <CardBody>
          <div style={{height: '300px', width: '70%'}}>
            <ChartDonut
              constrainToVisibleArea={true}
              data={[
                {x: 'Hits', y: stats.hits},
                {x: 'Misses', y: stats.misses},
                {x: 'Stores', y: stats.stores},
                {x: 'Retrievals', y: stats.retrievals},
                {x: 'Remove Hits', y: stats.remove_hits},
                {x: 'Removes Misses', y: stats.remove_misses},
                {x: 'Evictions', y: stats.evictions},
              ]}
              labels={({datum}) =>
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
                  name: 'Stores: ' + displayUtils.formatNumber(stats.stores),
                },
                {
                  name:
                    'Retrievals: ' +
                    displayUtils.formatNumber(stats.retrievals),
                },
                {
                  name:
                    'Remove hits: ' +
                    displayUtils.formatNumber(stats.remove_hits),
                },
                {
                  name:
                    'Remove misses: ' +
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
                right: 0, // Adjusted to accommodate legend
                top: 20,
              }}
              title={ displayUtils.formatBigNumber(all) }
              width={600}
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
    const message = 'Statistics disabled.';

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
      <GridItem span={12}>{buildDataAccess()}</GridItem>
      <GridItem span={12}>{buildQueryStats()}</GridItem>
    </Grid>
  );
};

export { CacheMetrics };
