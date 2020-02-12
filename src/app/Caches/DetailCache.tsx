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
  Label,
  Level,
  LevelItem,
  PageSection,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title
} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import {
  CubesIcon,
  DegradedIcon,
  KeyIcon,
  SaveIcon,
  ServiceIcon,
  Spinner2Icon,
  StorageDomainIcon,
  UnknownIcon
} from '@patternfly/react-icons';
import {chart_color_black_200, chart_color_blue_300} from '@patternfly/react-tokens';
import {ChartDonut, ChartThemeColor} from '@patternfly/react-charts';
import {CardTitle} from "@app/Common/CardTitle";

const DetailCache: React.FunctionComponent<any> = props => {
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
      indexing_in_progress: false
    };

    const cacheName: string = props.location.state.cacheName;
    const [detail, setDetail] = useState<DetailedInfinispanCache>(emptyDetail);
    const [xsite, setXsite] = useState<XSite[]>([]);

    useEffect(() => {
      cacheService.retrieveFullDetail(cacheName).then(detailedCache => {
        setDetail(detailedCache);
      });
    }, []);

    useEffect(() => {
      cacheService.retrieveXSites(cacheName).then(xsites => {
        setXsite(xsites);
      });
    }, []);

    const OperationsPerformance = () => {
      return (
        <Card>
          <CardHeader>
            <CardTitle
              title={'Operations Performance'}
              toolTip={'Average values for this cache in milliseconds'}
            />
          </CardHeader>
          <CardBody>
            <DisplayOpsPerformance/>
          </CardBody>
        </Card>
      );
    };

    const DisplayOpsPerformance = () => {
      if (detail.stats === undefined) {
        return (
          <EmptyState variant={EmptyStateVariant.small}>
            <EmptyStateIcon icon={UnknownIcon}/>
          </EmptyState>
        );
      }

      return (
        <TextContent>
          <TextList component={TextListVariants.dl}>
            <TextListItem component={TextListItemVariants.dt}>
              {detail.stats.average_read_time}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Avg Reads
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {detail.stats.average_write_time}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Avg Writes
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {detail.stats.average_remove_time}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Avg Removes
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              -
            </TextListItem>
          </TextList>
        </TextContent>
      );
    };

    const CacheContent = () => {
      return (
        <Card>
          <CardHeader>
            <CardTitle
              title={'Cache Content'}
              toolTip={'Statistics this cache'}
            />
          </CardHeader>
          <CardBody>
            <DisplayCacheContent/>
          </CardBody>
        </Card>
      );
    };

    const DisplayCacheContent = () => {
      if (detail.stats === undefined) {
        return (
          <EmptyState variant={EmptyStateVariant.small}>
            <EmptyStateIcon icon={UnknownIcon}/>
          </EmptyState>
        );
      }

      return (
        <TextContent>
          <TextList component={TextListVariants.dl}>
            <TextListItem component={TextListItemVariants.dt}>
              {detail.stats.current_number_of_entries}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Current number of entries
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {detail.stats.current_number_of_entries_in_memory}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Current number of entries in memory
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {detail.stats.total_number_of_entries}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Total number of entries
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {detail.stats.required_minimum_number_of_nodes}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Required Minimum number of nodes
            </TextListItem>
          </TextList>
        </TextContent>
      );
    };

    const CacheLoader = () => {
      return (
        <Card>
          <CardHeader>
            <CardTitle
              title={'Data access'}
              toolTip={'Data access for this cache'}
            />
          </CardHeader>
          <CardBody>
            <DisplayCacheLoader/>
          </CardBody>
        </Card>
      );
    };

    const DisplayCacheLoader = () => {
      let all = 0;
      if (detail.stats !== undefined) {
        all = detail.stats.hits +
          detail.stats.retrievals +
          detail.stats.remove_hits +
          detail.stats.remove_misses +
          detail.stats.stores +
          detail.stats.misses +
          detail.stats.evictions;
      }

      if (detail.stats === undefined) {
        return (
          <EmptyState variant={EmptyStateVariant.small}>
            <EmptyStateIcon icon={UnknownIcon}/>
          </EmptyState>
        );
      }

      return (
        <div style={{height: '208px', width: '400px'}}>
          <ChartDonut
            constrainToVisibleArea={true}
            data={[
              {x: 'Hits', y: detail.stats.hits},
              {x: 'Misses', y: detail.stats.misses},
              {x: 'Stores', y: detail.stats.stores},
              {x: 'Retrievals', y: detail.stats.retrievals},
              {x: 'Remove Hits', y: detail.stats.remove_hits},
              {x: 'Removes Misses', y: detail.stats.remove_misses},
              {x: 'Evictions', y: detail.stats.evictions}
            ]}
            labels={({datum}) => `${datum.x}: ${datum.y}%`}
            legendData={[
              {name: 'Hits: ' + detail.stats.hits},
              {name: 'Misses: ' + detail.stats.misses},
              {name: 'Retrievals: ' + detail.stats.retrievals},
              {name: 'Stores: ' + detail.stats.stores},
              {name: 'Remove Hits: ' + detail.stats.remove_hits},
              {name: 'Remove Misses: ' + detail.stats.remove_misses},
              {name: 'Evictions: ' + detail.stats.evictions}
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
            themeColor={ChartThemeColor.multiOrdered}
          />
        </div>
      );
    };

    const XSitePanel = () => {
      if (xsite.length == 0) {
        return <span/>;
      }

      return (
        <Card style={{height:280}}>
          <CardHeader>
            <CardTitle
              title={'Backups'}
              toolTip={'Remote backups for this cache'}
            />
          </CardHeader>
          <CardBody>
            <TextContent>
              {xsite.map(xsite => {
                let label = xsite.name + ' - ' + xsite.status;
                return <Text component={TextVariants.p}>{label}</Text>
              })}
            </TextContent>
          </CardBody>
        </Card>
      );
    };

    const CacheFeature: React.FunctionComponent<any> = props => {
      return (
        <LevelItem>
          <Label style={{backgroundColor: props.color}}>
            {' '}
            {props.icon} {' ' + props.label}
          </Label>
        </LevelItem>
      );
    };

    const CacheStats = () => {
      if (detail.stats == undefined || !detail.stats.enabled) {
        return (
          <EmptyState variant={EmptyStateVariant.small}>
            <EmptyStateIcon icon={CubesIcon}/>
            <Title headingLevel="h5" size="lg">
              Statistics are not enabled
            </Title>
            <EmptyStateBody>
              <strong>{detail.name + ' '}</strong> cache has not statistics enabled
            </EmptyStateBody>
          </EmptyState>
        );
      }

      return (
        <Grid gutter="md">
          <GridItem span={6} rowSpan={2}>
            <CacheContent/>
            <CacheLoader/>
          </GridItem>
          <GridItem span={6}>
            <OperationsPerformance/>
          </GridItem>
          <GridItem span={6}>
            <XSitePanel/>
          </GridItem>
        </Grid>
      );
    };

    const hasFeatureColor = feature => {
      if (feature) {
        return chart_color_blue_300.value;
      } else {
        return chart_color_black_200.value;
      }
    };
    return (
      <PageSection>
        <Stack gutter={'lg'}>
          <StackItem>
            <TextContent>
              <Text component={TextVariants.h1}>Cache {detail.name}</Text>
            </TextContent>
          </StackItem>
          <StackItem>
            <Level>
              <LevelItem>
                <CacheFeature
                  icon={<Spinner2Icon/>}
                  color={hasFeatureColor(detail.bounded)}
                  label={'Bounded'}
                />
              </LevelItem>
              <LevelItem>
                <CacheFeature
                  icon={<StorageDomainIcon/>}
                  color={hasFeatureColor(detail.indexed)}
                  label={'Indexed'}
                />
              </LevelItem>
              <LevelItem>
                <CacheFeature
                  icon={<SaveIcon/>}
                  color={hasFeatureColor(detail.persistent)}
                  label={'Persisted'}
                />
              </LevelItem>
              <LevelItem>
                <CacheFeature
                  icon={<ServiceIcon/>}
                  color={hasFeatureColor(detail.transactional)}
                  label={'Transactional'}
                />
              </LevelItem>
              <LevelItem>
                <CacheFeature
                  icon={<KeyIcon/>}
                  color={hasFeatureColor(detail.secured)}
                  label={'Secured'}
                />
              </LevelItem>
              <LevelItem>
                <CacheFeature
                  icon={<DegradedIcon/>}
                  color={hasFeatureColor(detail.has_remote_backup)}
                  label={'Has remote backups'}
                />
              </LevelItem>
            </Level>
          </StackItem>
          <StackItem>
            <CacheStats/>
          </StackItem>
        </Stack>
      </PageSection>
    );
  }
;

export {DetailCache};
