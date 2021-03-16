import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { ArrowIcon, CubesIcon } from '@patternfly/react-icons';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { Link } from 'react-router-dom';
import { CustomCardTitle } from '@app/Common/CustomCardTitle';
import displayUtils from '@services/displayUtils';
import { global_spacer_2xl } from '@patternfly/react-tokens';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useFetchGlobalStats } from '@app/services/statsHook';

const GlobalStats = () => {
  const { stats, error, loading } = useFetchGlobalStats();

  const allOps = () => {
    return (
      stats.hits +
      stats.misses +
      stats.remove_hits +
      stats.remove_misses +
      stats.stores +
      stats.evictions
    );
    if (stats?.statistics_enabled) {
    }
    return 0;
  };

  const buildStats = () => {
    if (loading && !error) {
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

    if (!loading && !error && !stats.statistics_enabled) {
      return (
        <Card>
          <CardBody>
            <EmptyState variant={EmptyStateVariant.full}>
              <EmptyStateIcon icon={CubesIcon} />
              <Title headingLevel="h5" size="lg">
                Global statistics disabled
              </Title>
              <EmptyStateBody>
                Statistics are disabled. To enable statistics, set
                statistics=true in the configuration.
              </EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return (
      <Grid hasGutter={true}>
        <GridItem span={6} rowSpan={2}>
          <Card>
            <CardTitle>
              <Level>
                <LevelItem>
                  <CustomCardTitle
                    title={'Cluster-wide statistics'}
                    toolTip={'Statistics for all caches across the cluster.'}
                  />
                </LevelItem>
                <LevelItem>
                  <Link to={{ pathname: '/' }}>
                    <Button variant={ButtonVariant.link} icon={<ArrowIcon />}>
                      View all caches
                    </Button>
                  </Link>
                </LevelItem>
              </Level>
            </CardTitle>
            <CardBody>
              <TextContent>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.number_of_entries)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Number of entries
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(
                      stats.current_number_of_entries_in_memory
                    )}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Current number of entries in memory
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.total_number_of_entries)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Total number of entries
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.data_memory_used)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Data memory used
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.off_heap_memory_used)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Off-heap memory used
                  </TextListItem>
                </TextList>
              </TextContent>
            </CardBody>
          </Card>
          <Card>
            <CardTitle>
              <CustomCardTitle
                title={'Data access statistics'}
                toolTip={'Data access statistics for all caches across the cluster.'}
              />
            </CardTitle>
            <CardBody style={{ paddingBottom: global_spacer_2xl.value }}>
              <div style={{ height: '208px', width: '450px' }}>
                <ChartDonut
                  constrainToVisibleArea={true}
                  data={[
                    { x: 'Retrieval hits', y: stats.hits },
                    { x: 'Retrieval misses', y: stats.misses },
                    { x: 'Stores', y: stats.stores },
                    { x: 'Remove hits', y: stats.remove_hits },
                    { x: 'Removes misses', y: stats.remove_misses },
                    { x: 'Evictions', y: stats.evictions },
                  ]}
                  labels={({ datum }) =>
                    `${datum.x}: ${displayUtils.formatNumber(
                      (datum.y * 100) / allOps()
                    )}%`
                  }
                  legendData={[
                    {
                      name:
                        'Retrieval hits: ' +
                        displayUtils.formatNumber(stats.hits),
                    },
                    {
                      name:
                        'Retrieval misses: ' +
                        displayUtils.formatNumber(stats.misses),
                    },
                    {
                      name:
                        'Stores: ' + displayUtils.formatNumber(stats.stores),
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
                        'Evictions: ' +
                        displayUtils.formatNumber(stats.evictions),
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
                  title={displayUtils.formatBigNumber(allOps())}
                  width={400}
                  themeColor={ChartThemeColor.multiOrdered}
                />
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardTitle>
              <CustomCardTitle
                title={'Operation performance values'}
                toolTip={'Average values, in milliseconds, for operations on all caches across the cluster.'}
              />
            </CardTitle>
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
                    {displayUtils.formatNumber(stats.average_remove_time)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Average removes
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.average_write_time)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Average writes
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.read_write_ratio)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Read/Write ratio
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.hit_ratio)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Hits ratio
                  </TextListItem>
                </TextList>
              </TextContent>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardTitle>
              <Level>
                <LevelItem>
                  <CustomCardTitle
                    title={'Cache Manager lifecycle values'}
                    toolTip={'Lifecycle values, in milliseconds, for the Cache Manager.'}
                  />
                </LevelItem>
                <LevelItem>
                  <Link to={{ pathname: '/cluster-membership' }}>
                    <Button variant={ButtonVariant.link} icon={<ArrowIcon />}>
                      View cluster membership
                    </Button>
                  </Link>
                </LevelItem>
              </Level>
            </CardTitle>
            <CardBody>
              <TextContent style={{ height: '208px' }}>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.time_since_start)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Time since start
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {displayUtils.formatNumber(stats.time_since_reset)}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Time since reset
                  </TextListItem>
                </TextList>
              </TextContent>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    );
  };

  const descriptionText = () => {
    if (stats.statistics_enabled) {
      return 'Global statistics for all caches in the cluster';
    } else {
      return 'You must enable global statistics in the Cache Manager configuration to display values.';
    }
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component={TextVariants.h1}>Global statistics</Text>
          <Text component={TextVariants.p}>{descriptionText()}</Text>
        </TextContent>
      </PageSection>
      <PageSection>{buildStats()}</PageSection>
    </React.Fragment>
  );
};

export { GlobalStats };
