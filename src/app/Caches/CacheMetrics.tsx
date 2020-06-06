import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem, Spinner,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { CardTitle } from '@app/Common/CardTitle';
import displayUtils from '../../services/displayUtils';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { CubesIcon } from '@patternfly/react-icons';

const CacheMetrics: React.FunctionComponent<any> = (props: {
  stats: (CacheStats|undefined);
  xSite: XSite[];
}) => {
  const buildOperationsPerformanceCard = () => {
    if (!props.stats) {
      return (
        <Spinner size={'md'}/>
        );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle
            title={'Operations Performance'}
            toolTip={'Average values for this cache in milliseconds'}
          />
        </CardHeader>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(props.stats.average_read_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Avg Reads
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(props.stats.average_write_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Avg Writes
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(props.stats.average_remove_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Avg Removes
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>-</TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const buildCacheLoaderCard = () => {
    if (!props.stats) {
      return '';
    }

    let all =
      props.stats.hits +
      props.stats.retrievals +
      props.stats.remove_hits +
      props.stats.remove_misses +
      props.stats.stores +
      props.stats.misses +
      props.stats.evictions;

    return (
      <Card>
        <CardHeader>
          <CardTitle
            title={'Data access'}
            toolTip={'Data access for this cache'}
          />
        </CardHeader>
        <CardBody>
          <div style={{ height: '208px', width: '400px' }}>
            <ChartDonut
              constrainToVisibleArea={true}
              data={[
                { x: 'Hits', y: props.stats.hits },
                { x: 'Misses', y: props.stats.misses },
                { x: 'Stores', y: props.stats.stores },
                { x: 'Retrievals', y: props.stats.retrievals },
                { x: 'Remove Hits', y: props.stats.remove_hits },
                { x: 'Removes Misses', y: props.stats.remove_misses },
                { x: 'Evictions', y: props.stats.evictions }
              ]}
              labels={({ datum }) => `${datum.x}: ${datum.y}%`}
              legendData={[
                {
                  name: 'Hits: ' + displayUtils.formatNumber(props.stats.hits)
                },
                {
                  name:
                    'Misses: ' + displayUtils.formatNumber(props.stats.misses)
                },
                {
                  name:
                    'Retrievals: ' +
                    displayUtils.formatNumber(props.stats.retrievals)
                },
                {
                  name:
                    'Stores: ' + displayUtils.formatNumber(props.stats.stores)
                },
                {
                  name:
                    'Remove Hits: ' +
                    displayUtils.formatNumber(props.stats.remove_hits)
                },
                {
                  name:
                    'Remove Misses: ' +
                    displayUtils.formatNumber(props.stats.remove_misses)
                },
                {
                  name:
                    'Evictions: ' +
                    displayUtils.formatNumber(props.stats.evictions)
                }
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
        </CardBody>
      </Card>
    );
  };

  const buildCacheContentCard = () => {
    if (!props.stats) {
      return '';
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle
            title={'Cache Content'}
            toolTip={'Statistics this cache'}
          />
        </CardHeader>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(
                  props.stats.current_number_of_entries
                )}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Current number of entries
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(
                  props.stats.current_number_of_entries_in_memory
                )}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Current number of entries in memory
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(props.stats.total_number_of_entries)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Total number of entries
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(
                  props.stats.required_minimum_number_of_nodes
                )}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Required Minimum number of nodes
              </TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const buildXSiteCard = () => {
    if (props.xSite.length == 0) {
      return '';
    }

    return (
      <Card style={{ height: 280 }}>
        <CardHeader>
          <CardTitle
            title={'Backups'}
            toolTip={'Remote backups for this cache'}
          />
        </CardHeader>
        <CardBody>
          <TextContent>
            {props.xSite.map(xsite => {
              let label = xsite.name + ' - ' + xsite.status;
              return <Text component={TextVariants.p}>{label}</Text>;
            })}
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  if (!props.stats?.enabled) {
    const message = 'Statistics not enabled';

    return (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={CubesIcon} />
        <Title headingLevel="h5" size="lg">
          Statistics
        </Title>
        <EmptyStateBody>
          <TextContent>
            <Text component={TextVariants.p}>{message}</Text>
          </TextContent>
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Grid hasGutter={true}>
      <GridItem span={6} rowSpan={2}>
        {buildCacheContentCard()}
        {buildCacheLoaderCard()}
      </GridItem>
      <GridItem span={6}>{buildOperationsPerformanceCard()}</GridItem>
      <GridItem span={6}>{buildXSiteCard()}</GridItem>
    </Grid>
  );
};

export { CacheMetrics };
