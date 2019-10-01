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
      <Stack height={10}>
        <StackItem><strong>Avg Reads:</strong> {detail.opsPerformance.avgReads} ms</StackItem>
        <StackItem><strong>Avg Writes:</strong> {detail.opsPerformance.avgWrites} ms</StackItem>
        <StackItem><strong>Avg Removes</strong>: {detail.opsPerformance.avgRemoves} ms</StackItem>
        <StackItem>{'-'}</StackItem>
      </Stack>
  }

  function CachingActivity() {
    return <Card>
      <CardHead>
        <PortIcon/>
      </CardHead>
      <CardHeader>Caching activity</CardHeader>
      <CardBody>
        <DisplayCachingActivity/>
      </CardBody>
    </Card>
  }

  const DisplayCachingActivity = () => {
    return detail.cacheActivity == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={PortIcon}/>
      </EmptyState> :
      <Stack>
        <StackItem><strong># READ hits	</strong> {detail.cacheActivity.readHits}</StackItem>
        <StackItem><strong># READ misses	</strong> {detail.cacheActivity.readMisses}</StackItem>
        <StackItem><strong># REMOVE hits	</strong> {detail.cacheActivity.removeHits}</StackItem>
        <StackItem><strong># REMOVE misses	</strong> {detail.cacheActivity.removeMisses}</StackItem>
      </Stack>
  }

  function CacheContent() {
    return <Card>
      <CardHead>
        <MemoryIcon/>
      </CardHead>
      <CardHeader>Cache content</CardHeader>
      <CardBody>
          <DisplayCacheContent/>
      </CardBody>
    </Card>
  }

  const DisplayCacheContent= () => {
    return detail.cacheContent == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={MemoryIcon}/>
      </EmptyState> :
      <Stack>
        <StackItem><strong># Entries	</strong> {detail.cacheContent.size}</StackItem>
        <StackItem><strong>READ/WRITE ration	</strong> {detail.cacheContent.readWriteRatio}</StackItem>
        <StackItem><strong>HIT ration	</strong> {detail.cacheContent.hitRatio}</StackItem>
        <StackItem><strong>Max capacity	</strong> {detail.cacheContent.maxCapacity}</StackItem>
      </Stack>
  }
  return (
    <PageSection>
      <Title size="lg"> Cache <strong>{detail.name}</strong> </Title>
      
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
