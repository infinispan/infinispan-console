import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHead,
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
import dataContainerService from '../../services/dataContainerService';
import {
  CubesIcon,
  MonitoringIcon,
  PendingIcon
} from '@patternfly/react-icons';

const DetailStats: React.FunctionComponent<any> = props => {
  const cm: string = props.location.state.cacheManager;
  const [detail, setDetail] = useState<CacheManagerStats>({
    statistics_enabled: false,
    hits: -1,
    stores: -1,
    evictions: -1,
    remove_misses: -1,
    retrievals: -1,
    misses: -1,
    remove_hits: -1
  });

  useEffect(() => {
    dataContainerService.getCacheManagerStats(cm).then(detailedStats => {
      setDetail(detailedStats);
    });
  }, []);

  const DisplayStats = () => {
    return !detail.statistics_enabled ? (
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon} />
        <Title headingLevel="h5" size="lg">
          Statistics are not enabled
        </Title>
        <EmptyStateBody>
          Statistics are not enabled in this Cache Manager. To activate
          statistics, set statistics=true in the cache manager configuration.
        </EmptyStateBody>
      </EmptyState>
    ) : (
      <Grid gutter="md">
        <GridItem span={6}>
          <Card>
            <CardHead>
              <PendingIcon />
            </CardHead>
            <CardHeader>Cache manager lifecycle</CardHeader>
            <CardBody>
              <Stack>
                <StackItem>
                  <strong># Time since start </strong> {detail.time_since_start}
                </StackItem>
                <StackItem>
                  <strong># Time since reset </strong> {detail.time_since_reset}
                </StackItem>
                <StackItem>-</StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardHead>
              <MonitoringIcon />
            </CardHead>
            <CardHeader>Average values</CardHeader>
            <CardBody>
              <Stack>
                <StackItem>
                  <strong># Avg READS </strong> {detail.average_read_time}
                </StackItem>
                <StackItem>
                  <strong># Avg REMOVES </strong> {detail.average_remove_time}
                </StackItem>
                <StackItem>
                  <strong># Avg WRITES </strong> {detail.average_write_time}
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
      <Title size="lg">
        {' '}
        Stats <strong>{cm}</strong> cache manager
      </Title>
      <DisplayStats />
    </PageSection>
  );
};
export { DetailStats };
