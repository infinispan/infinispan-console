import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState, EmptyStateBody,
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
  CubesIcon,
  DegradedIcon,
  FolderOpenIcon,
  KeyIcon,
  MemoryIcon,
  MonitoringIcon,
  SaveIcon,
  ServiceIcon,
  Spinner2Icon,
  StorageDomainIcon,
  UnknownIcon
} from '@patternfly/react-icons'
import {chart_color_black_200, chart_color_blue_300} from "@patternfly/react-tokens";
import {ChartDonut} from "@patternfly/react-charts";

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
    return detail.stats == undefined ?
      <EmptyState variant={EmptyStateVariant.small}>
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
        <StackItem><strong>Required Minimum number of nodes </strong> {detail.stats.required_minimum_number_of_nodes}
        </StackItem>
      </Stack>
  };

  const CacheLoader = () => {
    return <Card>
      <CardHeader><FolderOpenIcon/> {' ' + 'Data access'}</CardHeader>
      <CardBody>
        <DisplayCacheLoader/>
      </CardBody>
    </Card>
  };

  const DisplayCacheLoader = () => {
    let all = detail.stats == undefined ? 0 : detail.stats.hits +
      detail.stats.retrievals +
      detail.stats.remove_hits +
      detail.stats.remove_misses +
      detail.stats.stores +
      detail.stats.misses +
      detail.stats.evictions;
    return detail.stats == undefined ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={UnknownIcon}/>
      </EmptyState> :
      <div style={{height: '208px', width: '400px'}}>
        <ChartDonut
          constrainToVisibleArea={true}
          data={[{x: 'Hits', y: detail.stats.hits},
            {x: 'Misses', y: detail.stats.misses},
            {x: 'Stores', y: detail.stats.stores},
            {x: 'Retrievals', y: detail.stats.retrievals},
            {x: 'Remove Hits', y: detail.stats.remove_hits},
            {x: 'Removes Misses', y: detail.stats.remove_misses},
            {x: 'Evictions', y: detail.stats.evictions}]}
          labels={({datum}) => `${datum.x}: ${datum.y}%`}
          legendData={[
            {name: 'Hits: ' + detail.stats.hits},
            {name: 'Misses: ' + detail.stats.misses},
            {name: 'Retrievals: ' + detail.stats.retrievals},
            {name: 'Stores: ' + detail.stats.stores},
            {name: 'Remove Hits: ' + detail.stats.remove_hits},
            {name: 'Remove Misses: ' + detail.stats.remove_misses},
            {name: 'Evictions: ' + detail.stats.evictions},
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
          title={'' + all}
          width={400}
        />
      </div>
  };

  const CacheFeature: React.FunctionComponent<any> = (props) => {
    return (<LevelItem>
      <Label style={{backgroundColor: props.color}}> {props.icon} {' ' + props.label}
      </Label></LevelItem>);
  };

  const CacheStats = () => {
    return detail.stats == undefined || !detail.stats.enabled ? <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={CubesIcon}/>
        <Title headingLevel="h5" size="lg">
          Statistics are not enabled
        </Title>
        <EmptyStateBody>
          <strong>{detail.name + ' '}</strong> cache has not statistics enabled
        </EmptyStateBody>
      </EmptyState> :
      <Grid gutter="md">
        <GridItem span={6}>
          <CacheContent/>
        </GridItem>
        <GridItem span={6}>
          <OperationsPerformance/>
        </GridItem>
        <GridItem span={12}>
          <CacheLoader/>
        </GridItem>
      </Grid>;
  };

  const hasFeatureColor = (feature) => {
    if (feature) {
      return chart_color_blue_300.value;
    } else {
      return chart_color_black_200.value;
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
        <StackItem><CacheStats/></StackItem>
      </Stack>
    </PageSection>
  );
};

export {DetailCache};
