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
    size: 0,
    configuration: '',
    persistent: false,
    transactional: false,
    bounded: false,
    indexed: false,
    secured: false,
    has_remote_backup: false,
    rehash_in_progress: false,
    indexing_in_progress: false,
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
    return detail.stats == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UnknownIcon}/>
      </EmptyState> :
      <Stack height={10}>
        <StackItem><strong>Avg Reads:</strong> {detail.stats.average_read_time} ms</StackItem>
        <StackItem><strong>Avg Writes:</strong> {detail.stats.average_write_time} ms</StackItem>
        <StackItem><strong>Avg Removes</strong>: {detail.stats.average_remove_time} ms</StackItem>
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
    return detail.stats == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UnknownIcon}/>
      </EmptyState> :
      <Stack>
        <StackItem><strong>Current number of entries </strong> {detail.stats.current_number_of_entries}</StackItem>
        <StackItem><strong>Current number of entries in
          memory </strong> {detail.stats.current_number_of_entries_in_memory}</StackItem>
        <StackItem><strong>Total number of entries </strong> {detail.stats.total_number_of_entries}</StackItem>
        <StackItem><strong>Required Minimum number of nodes </strong> {detail.stats.required_minimum_number_of_nodes}</StackItem>
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
    return detail.stats == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UnknownIcon}/>
      </EmptyState> :
      <Stack>
        <StackItem><strong># Hits </strong> {detail.stats.hits}</StackItem>
        <StackItem><strong># Misses </strong> {detail.stats.misses}</StackItem>
        <StackItem><strong># Remove Hits </strong> {detail.stats.remove_hits}</StackItem>
        <StackItem><strong># Remove Misses </strong> {detail.stats.remove_misses}</StackItem>
        <StackItem><strong># Evictions </strong> {detail.stats.evictions}</StackItem>
        <StackItem><strong># Retrievals </strong> {detail.stats.retrievals}</StackItem>
        <StackItem><strong># Stores </strong> {detail.stats.stores}</StackItem>
      </Stack>
  };

  const CacheFeature: React.FunctionComponent<any> = (props) => {
    return (<LevelItem>
      <Label color={props.color}> {props.icon} {' ' + props.label}
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
                                     color={hasFeatureColor(detail.has_remote_backup)}
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
