import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title
} from '@patternfly/react-core';
import {CubesIcon, FolderOpenIcon, MemoryIcon, MonitoringIcon, PendingIcon} from '@patternfly/react-icons';
import {ChartDonut, ChartThemeColor} from "@patternfly/react-charts";
import dataContainerService from "../../services/dataContainerService";

const Home: React.FunctionComponent<any> = props => {
  const [cacheManager, setCacheManager] = useState<undefined | CacheManager>(undefined);
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
    const allOps = function () {
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

    return !stats.statistics_enabled ? (
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon}/>
        <Title headingLevel="h5" size="lg">
          Statistics are not enabled
        </Title>
        <EmptyStateBody>
          Statistics are not enabled in this Cache Manager. To activate
          statistics, set statistics=true in the configuration.
        </EmptyStateBody>
      </EmptyState>
    ) : (
      <Grid gutter="md" style={{paddingTop: 40}}>
        <GridItem span={6}>
          <Card>
            <CardHeader>
              <MemoryIcon/>
              {' ' + 'Content'}
            </CardHeader>
            <CardBody>
              <Stack>
                <StackItem>
                  <strong># Number of entries </strong>{' '}
                  {stats.number_of_entries}
                </StackItem>
                <StackItem>
                  <strong># Current number of entries in memory </strong>{' '}
                  {stats.current_number_of_entries_in_memory}
                </StackItem>
                <StackItem>
                  <strong># Total number of entries </strong>{' '}
                  {stats.total_number_of_entries}
                </StackItem>
                <StackItem>
                  <strong># Data memory used </strong> {stats.data_memory_used}
                </StackItem>
                <StackItem>
                  <strong># Off heap memory used </strong>{' '}
                  {stats.off_heap_memory_used}
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardHeader>
              <MonitoringIcon/> {' ' + ' Operations Performance\n'}
            </CardHeader>
            <CardBody>
              <Stack>
                <StackItem>
                  <strong># Avg READS </strong> {stats.average_read_time}
                </StackItem>
                <StackItem>
                  <strong># Avg REMOVES </strong> {stats.average_remove_time}
                </StackItem>
                <StackItem>
                  <strong># Avg WRITES </strong> {stats.average_write_time}
                </StackItem>
                <StackItem>
                  <strong># Read/Write Ratio </strong> {stats.read_write_ratio}
                </StackItem>
                <StackItem>
                  <strong># Hits Ratio </strong> {stats.hit_ratio}
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={8}>
          <Card>
            <CardHeader>
              <FolderOpenIcon/> {' ' + 'Data access'}
            </CardHeader>
            <CardBody>
              <div style={{height: '208px', width: '400px'}}>
                <ChartDonut
                  constrainToVisibleArea={true}
                  data={[
                    {x: 'Hits', y: stats.hits},
                    {x: 'Misses', y: stats.misses},
                    {x: 'Stores', y: stats.stores},
                    {x: 'Retrievals', y: stats.retrievals},
                    {x: 'Remove Hits', y: stats.remove_hits},
                    {x: 'Removes Misses', y: stats.remove_misses},
                    {x: 'Evictions', y: stats.evictions}
                  ]}
                  labels={({datum}) => `${datum.x}: ${datum.y}%`}
                  legendData={[
                    {name: 'Hits: ' + stats.hits},
                    {name: 'Misses: ' + stats.misses},
                    {name: 'Retrievals: ' + stats.retrievals},
                    {name: 'Stores: ' + stats.stores},
                    {name: 'Remove Hits: ' + stats.remove_hits},
                    {name: 'Remove Misses: ' + stats.remove_misses},
                    {name: 'Evictions: ' + stats.evictions}
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
        <GridItem span={4}>
          <Card>
            <CardHeader>
              <PendingIcon/>
              {' ' + 'Cache manager lifecycle'}
            </CardHeader>
            <CardBody>
              <Stack style={{height: '208px'}}>
                <StackItem>
                  <strong># Time since start </strong> {stats.time_since_start}
                </StackItem>
                <StackItem>
                  <strong># Time since reset </strong> {stats.time_since_reset}
                </StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    );
  };

  return (
    <PageSection>
      <DisplayStats/>
    </PageSection>
  );
};

export {Home};
