import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CardHead,
  EmptyState, EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  PageSection, Stack, StackItem,
  Title,
} from '@patternfly/react-core';
import dataContainerService from "../../services/dataContainerService";
import {CubesIcon, MemoryIcon} from "@patternfly/react-icons";

const DetailStats: React.FunctionComponent<any> = (props) => {
  const cm: string = props.location.state.cacheManager;
  const [detail, setDetail] = useState<CacheManagerStats>({statistics_enabled: false},);

  useEffect(() => {
    dataContainerService.getCacheManagerStats(cm)
      .then(detailedStats => {
        console.log(detailedStats);
        setDetail(detailedStats);
      });
  }, []);

  /**
   * number_of_entries: -1,
   hit_ratio: -1,
   read_write_ratio: -1,
   current_number_of_entries: -1,
   current_number_of_entries_in_memory: -1,
   total_number_of_entries: -1,
   off_heap_memory_used: 0,
   data_memory_used: 0,
   stores: -1,
   retrievals: -2,
   hits: -1,
   misses: -1,
   remove_hits: -1,
   remove_misses: -1,
   evictions: -1,
   required_minimum_number_of_nodes: 0
   * @constructor
   */
  const DisplayStats = () => {
    return !detail.statistics_enabled ? <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon}/>
        <Title headingLevel="h5" size="lg">
          Statistics are not enabled
        </Title>
        <EmptyStateBody>
          Statistics are not enabled in this Cache Manager.
          To activate statistics, set statistics=true in the cache manager configuration.
          bla bla bla explain
        </EmptyStateBody>
      </EmptyState> :
      <Grid gutter="md">
        <GridItem span={6}>
          <Card>
            <CardHead>
              <MemoryIcon/> <Title size="xs">Cache manager lifecycle</Title>
            </CardHead>
            <CardBody>
              <Stack>
                <StackItem><strong># Time since start	</strong> {detail.time_since_start}</StackItem>
                <StackItem><strong># Time since reset	</strong> {detail.time_since_reset}</StackItem>
              </Stack>
            </CardBody>
          </Card>

        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardHead>
              <MemoryIcon/> <Title size="xs">Average values</Title>
            </CardHead>
            <CardBody>
              <Stack>
                <StackItem><strong># Avg READS	</strong> {detail.average_read_time}</StackItem>
                <StackItem><strong># Avg REMOVES	</strong> {detail.average_remove_time}</StackItem>
                <StackItem><strong># Avg WRITES	</strong> {detail.average_write_time}</StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={6}>
          tutu
        </GridItem>
        <GridItem span={6}>
          ioio
        </GridItem>
      </Grid>
  };

  return (
    <PageSection>
      <Title size="lg"> Stats <strong>{cm}</strong> cache manager</Title>
      <DisplayStats/>
    </PageSection>
  );
}
export {DetailStats};
