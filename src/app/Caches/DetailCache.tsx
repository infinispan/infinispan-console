import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Label,
  Level,
  LevelItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import cacheService from "../../services/cacheService";
import {
  DegradedIcon,
  KeyIcon,
  MemoryIcon,
  MonitoringIcon,
  SaveIcon,
  ServiceIcon,
  Spinner2Icon,
  StorageDomainIcon,
  UnknownIcon
} from '@patternfly/react-icons'
import {chart_color_black_100, chart_color_blue_500} from "@patternfly/react-tokens";
import {ChartPie} from "@patternfly/react-charts";

const DetailCache: React.FunctionComponent<any> = (props) => {
  const emptyDetail: DetailedInfinispanCache = {
    name: 'empty',
    started: false,
    type: '',
    persistent: false,
    transactional: false,
    bounded: false,
    indexed: false,
    secured: false,
    hasRemoteBackup: false,
    rehashInProgress: false,
    indexingInProgress: false,
    timeSinceReset: 0,
    timeSinceStart: 0
  };

  const cacheName: string = props.location.state.cacheName;
  const [detail, setDetail] = useState<DetailedInfinispanCache>(emptyDetail);

  useEffect(() => {
    cacheService.retrieveFullDetail(cacheName)
      .then(detailedCache => {
        setDetail(detailedCache)
      });
  }, []);


  const OperationsPerformance = () => {
    return <Card>
      <CardHeader><MonitoringIcon/> {' ' + 'Operations Performance'}</CardHeader>
      <CardBody>
        <DisplayOpsPerformance/>
      </CardBody>
    </Card>
  };

  const DisplayOpsPerformance = () => {
    return detail.opsPerformance == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UnknownIcon}/>
      </EmptyState> :
      <Stack height={10}>
        <StackItem><strong>Avg Reads:</strong> {detail.opsPerformance.avgReads} ms</StackItem>
        <StackItem><strong>Avg Writes:</strong> {detail.opsPerformance.avgWrites} ms</StackItem>
        <StackItem><strong>Avg Removes</strong>: {detail.opsPerformance.avgRemoves} ms</StackItem>
        <StackItem>{'-'}</StackItem>
      </Stack>
  };

  const CacheContent = () => {
    return <Card>
      <CardHeader> <MemoryIcon/> {' ' + 'Cache content'}</CardHeader>
      <CardBody>
        <DisplayCacheContent/>
      </CardBody>
    </Card>
  };

  const DisplayCacheContent = () => {
    return detail.cacheContent == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UnknownIcon}/>
      </EmptyState> :
      <Stack>
        <StackItem><strong>Current number of entries </strong> {detail.cacheContent.currentNumberOfEntries}</StackItem>
        <StackItem><strong>Current number of entries in
          memory </strong> {detail.cacheContent.currentNumberOfEntriesInMemory}</StackItem>
        <StackItem><strong>Total number of entries </strong> {detail.cacheContent.totalNumberOfEntries}</StackItem>
        <StackItem><strong>Max capacity </strong> {detail.cacheContent.requiredMinimumNumberOfNodes}</StackItem>
      </Stack>
  };

  const CacheLoader = () => {
    return <Card>
      <CardHeader><MemoryIcon/> {' ' + 'Cache loading'}</CardHeader>
      <CardBody>
        <DisplayCacheLoader/>
      </CardBody>
    </Card>
  };

  const DisplayCacheLoader = () => {
    return detail.cacheLoader == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UnknownIcon}/>
      </EmptyState> :
      <Stack>
        <StackItem><strong># Hits </strong> {detail.cacheLoader.hits}</StackItem>
        <StackItem><strong># Misses </strong> {detail.cacheLoader.misses}</StackItem>
        <StackItem><strong># Remove Hits </strong> {detail.cacheLoader.removeHits}</StackItem>
        <StackItem><strong># Remove Misses </strong> {detail.cacheLoader.removeMisses}</StackItem>
        <StackItem><strong># Evictions </strong> {detail.cacheLoader.evictions}</StackItem>
        <StackItem><strong># Retrievals </strong> {detail.cacheLoader.retrievals}</StackItem>
        <StackItem><strong># Stores </strong> {detail.cacheLoader.stores}</StackItem>
      </Stack>
  };

  const CacheFeature: React.FunctionComponent<any> = (props) => {
    return (<LevelItem>
      <Label> {props.icon} {' ' + props.label}
      </Label></LevelItem>);
  };
  const hasFeatureColor = (feature) => {
    if (feature) {
      return chart_color_blue_500.value;
    } else {
      return chart_color_black_100.value;
    }
  };
  return (
    <PageSection>
      <Stack gutter={"lg"}>
        <StackItem><Title size="lg"> Cache <strong>{detail.name}</strong> </Title></StackItem>
        <StackItem>
          <Level>
            <LevelItem><CacheFeature icon={<Spinner2Icon/>}
                                     color={hasFeatureColor(detail.bounded)}
                                     label={'Bounded'}/></LevelItem>
            <LevelItem><CacheFeature icon={<StorageDomainIcon/>}
                                     color={hasFeatureColor(detail.indexed)}
                                     label={'Indexed'}/></LevelItem>
            <LevelItem><CacheFeature icon={<SaveIcon/>}
                                     color={hasFeatureColor(detail.persistent)}
                                     label={'Persisted'}/></LevelItem>
            <LevelItem><CacheFeature icon={<ServiceIcon/>}
                                     color={hasFeatureColor(detail.transactional)}
                                     label={'Transactional'}/></LevelItem>
            <LevelItem><CacheFeature icon={<KeyIcon/>}
                                     color={hasFeatureColor(detail.secured)}
                                     label={'Secured'}/></LevelItem>
            <LevelItem><CacheFeature icon={<DegradedIcon/>}
                                     color={hasFeatureColor(detail.hasRemoteBackup)}
                                     label={'Has remote backups'}/></LevelItem>
          </Level>
        </StackItem>
        <StackItem>
          <Grid gutter="md">
            <GridItem span={4}>
              <CacheContent/>
            </GridItem>
            <GridItem span={4}>
              <OperationsPerformance/>
            </GridItem>
            <GridItem span={4}>
              <CacheLoader/>
            </GridItem>
          </Grid></StackItem>
      </Stack>
    </PageSection>
  );
};

export {DetailCache};
