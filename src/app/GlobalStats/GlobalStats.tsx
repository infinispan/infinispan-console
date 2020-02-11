import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Level,
  LevelItem,
  PageSection,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import {
  ArrowIcon,
  CubesIcon,
  OutlinedQuestionCircleIcon
} from '@patternfly/react-icons';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import dataContainerService from '../../services/dataContainerService';
import { Link } from 'react-router-dom';

const GlobalStats: React.FunctionComponent<any> = props => {
  const [cacheManager, setCacheManager] = useState<undefined | CacheManager>(
    undefined
  );
  const [stats, setStats] = useState<CacheManagerStats>({
    statistics_enabled: false,
    hits: -1,
    retrievals: -1,
    remove_misses: -1,
    remove_hits: -1,
    evictions: -1,
    stores: -1,
    misses: -1
  });
  useEffect(() => {
    dataContainerService.getCacheManagers().then(cacheManagers => {
      if (cacheManagers.length > 0) {
        setCacheManager(cacheManagers[0]);
        dataContainerService
          .getCacheManagerStats(cacheManagers[0].name)
          .then(detailedStats => setStats(detailedStats));
      }
    });
  }, []);

  const DisplayStats = () => {
    const allOps = function() {
      return stats != undefined && stats.statistics_enabled
        ? stats.hits +
            stats.retrievals +
            stats.remove_hits +
            stats.remove_misses +
            stats.stores +
            stats.misses +
            stats.evictions
        : 0;
    };

    const CardTitle = (props: { title: string; toolTip: string }) => {
      return (
        <TextContent>
          <Text component={TextVariants.h2}>
            {props.title}{' '}
            <Tooltip
              position={TooltipPosition.top}
              content={<div>{props.toolTip}</div>}
            >
              <OutlinedQuestionCircleIcon style={{ fontSize: 15 }} />
            </Tooltip>
          </Text>
        </TextContent>
      );
    };

    if (!stats.statistics_enabled) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon} />
          <Title headingLevel="h5" size="lg">
            Statistics are not enabled
          </Title>
          <EmptyStateBody>
            Statistics are not enabled. To activate statistics, set
            statistics=true in the configuration.
          </EmptyStateBody>
        </EmptyState>
      );
    }
    return (
      <Grid gutter="md" style={{ paddingTop: 40 }}>
        <GridItem span={6} rowSpan={2}>
          <Card>
            <CardHeader>
              <Level>
                <LevelItem>
                  <CardTitle
                    title={'Cluster Content'}
                    toolTip={'Statistics for all caches'}
                  />
                </LevelItem>
                <LevelItem>
                  <Link to={{ pathname: '/' }}>
                    <Button variant="link" icon={<ArrowIcon />}>
                      View all caches
                    </Button>
                  </Link>
                </LevelItem>
              </Level>
            </CardHeader>
            <CardBody>
              <TextContent>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.number_of_entries}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Number of entries
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.current_number_of_entries_in_memory}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Current number of entries in memory
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.total_number_of_entries}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Total number of entries
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.data_memory_used}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Data memory used
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.off_heap_memory_used}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Off heap memory used
                  </TextListItem>
                </TextList>
              </TextContent>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle
                title={'Data access'}
                toolTip={'Data access for all caches'}
              />
            </CardHeader>
            <CardBody style={{ paddingBottom: 50 }}>
              <div style={{ height: '208px', width: '450px' }}>
                <ChartDonut
                  constrainToVisibleArea={true}
                  data={[
                    { x: 'Hits', y: stats.hits },
                    { x: 'Misses', y: stats.misses },
                    { x: 'Stores', y: stats.stores },
                    { x: 'Retrievals', y: stats.retrievals },
                    { x: 'Remove Hits', y: stats.remove_hits },
                    { x: 'Removes Misses', y: stats.remove_misses },
                    { x: 'Evictions', y: stats.evictions }
                  ]}
                  labels={({ datum }) => `${datum.x}: ${datum.y}%`}
                  legendData={[
                    { name: 'Hits: ' + stats.hits },
                    { name: 'Misses: ' + stats.misses },
                    { name: 'Retrievals: ' + stats.retrievals },
                    { name: 'Stores: ' + stats.stores },
                    { name: 'Remove Hits: ' + stats.remove_hits },
                    { name: 'Remove Misses: ' + stats.remove_misses },
                    { name: 'Evictions: ' + stats.evictions }
                  ]}
                  legendOrientation="vertical"
                  legendPosition="right"
                  padding={{
                    bottom: 40,
                    left: 80,
                    right: 200, // Adjusted to accommodate legend
                    top: 20
                  }}
                  subTitle="Data access"
                  title={'' + allOps()}
                  width={400}
                  themeColor={ChartThemeColor.multiOrdered}
                />
              </div>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardHeader>
              <CardTitle
                title={'Operations Performance'}
                toolTip={'Average values for all caches in milliseconds'}
              />
            </CardHeader>
            <CardBody>
              <TextContent>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.average_read_time}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Avg READS
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.average_remove_time}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Avg REMOVES
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.average_write_time}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Avg WRITES
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.read_write_ratio}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Read/Write Ratio
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.hit_ratio}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Hits Ratio
                  </TextListItem>
                </TextList>
              </TextContent>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardHeader>
              <Level>
                <LevelItem>
                  <CardTitle
                    title={'Cache Manager Lifecycle'}
                    toolTip={'Lifecycle values are in milliseconds'}
                  />
                </LevelItem>
                <LevelItem>
                  <Link to={{ pathname: '/cluster-status' }}>
                    <Button variant="link" icon={<ArrowIcon />}>
                      View Cluster Status
                    </Button>
                  </Link>
                </LevelItem>
              </Level>
            </CardHeader>
            <CardBody>
              <TextContent style={{ height: '208px' }}>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.time_since_start}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Time since start
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    {stats.time_since_reset}
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
      return 'JMX statistics are globally enabled';
    } else {
      return 'Explicitly enable JMX statistics globally to display them';
    }
  };

  return (
    <PageSection>
      <TextContent>
        <Text component={TextVariants.h1}>Global statistics</Text>
        <Text component={TextVariants.p}>{descriptionText()}</Text>
      </TextContent>
      <DisplayStats />
    </PageSection>
  );
};

export { GlobalStats };
