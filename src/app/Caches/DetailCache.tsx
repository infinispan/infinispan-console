import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CardHead,
  CardHeader,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import cacheService from "../../services/cacheService";
import {MemoryIcon, MonitoringIcon, PortIcon} from '@patternfly/react-icons'

const DetailCache: React.FunctionComponent<any> = (props) => {
  const cacheName: string = props.location.state.cacheName;
  const [detail, setDetail] = useState<DetailedInfinispanCache>({name: cacheName},);

  useEffect(() => {
    cacheService.retrieveFullDetail(cacheName)
      .then(detailedCache =>{
        setDetail(detailedCache)});
  }, []);


  function OperationsPerformance(){
    return <Card>
      <CardHead>
        <MonitoringIcon/>
      </CardHead>
      <CardHeader>Operations Performance</CardHeader>
      <CardBody>
        <DisplayOpsPerformance/>
      </CardBody>
    </Card>
  }

  const DisplayOpsPerformance = () => {
    return detail.opsPerformance == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={MonitoringIcon}/>
      </EmptyState> :
      <Stack>
        <StackItem><strong>Avg Reads:</strong> {detail.opsPerformance.avgReads} ms</StackItem>
        <StackItem><strong>Avg Writes:</strong> {detail.opsPerformance.avgWrites} ms</StackItem>
        <StackItem><strong>Avg Removes</strong>: {detail.opsPerformance.avgRemoves} ms</StackItem>
      </Stack>
  }

  function CachingActivity() {
    return <Card>
      <CardHead>
        <PortIcon/>
      </CardHead>
      <CardHeader>Caching activity</CardHeader>
      <CardBody>

      </CardBody>
    </Card>
  }

  function CacheContent() {
    return <Card>
      <CardHead>
        <MemoryIcon/>
      </CardHead>
      <CardHeader>Cache content</CardHeader>
      <CardBody>

      </CardBody>
    </Card>
  }

  return (
    <PageSection>
      <Title size="lg"> Cache {detail.name} </Title>

      <Grid gutter="md">
        <GridItem span={4}>
          <CacheContent/>
        </GridItem>
        <GridItem span={4}>
          <CachingActivity/>
        </GridItem>
        <GridItem span={4}>
          <OperationsPerformance/>
        </GridItem>

      </Grid>

    </PageSection>
  );
}
export {DetailCache};
