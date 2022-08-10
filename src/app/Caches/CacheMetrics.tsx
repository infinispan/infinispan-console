import React, {useEffect, useState} from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  CardFooter,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title,
  List,
  ListItem
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import {ChartDonut, ChartThemeColor} from '@patternfly/react-charts';
import {CubesIcon} from '@patternfly/react-icons';
import {QueryMetrics} from '@app/Caches/Query/QueryMetrics';
import {ConsoleServices} from "@services/ConsoleServices";
import {CustomCardTitle} from "@app/Common/CustomCardTitle";
import {MoreInfoTooltip} from '@app/Common/MoreInfoTooltip';
import { ExpandableSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

const CacheMetrics = (props: { cacheName: string; display: boolean }) => {
  const [stats, setStats] = useState<CacheStats | undefined>(undefined);
  const [statsError, setStatsError] = useState<string | undefined>(undefined);
  const [displayQueryStats, setDisplayQueryStats] = useState<boolean>(false);
  const [size, setSize] = useState<number|undefined>(0)
  const [memory, setMemory] = useState<string|undefined>(undefined)
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  useEffect(() => {
    ConsoleServices.caches().retrieveFullDetail(props.cacheName).then((detail) => {
      if (detail.isRight()) {

        // Load the memory storage and size eviction
        const loadMemory = JSON.parse(detail.value.configuration.config)[props.cacheName]["distributed-cache"]
        if(loadMemory.memory){
          if(loadMemory.memory.storage==="HEAP" && loadMemory.memory["max-size"])
            setMemory(loadMemory.memory.storage)
          else if(loadMemory.memory.storage==="OFF_HEAP")
            setMemory(loadMemory.memory.storage)
        }

        setSize(detail.value.size)
        setStats(detail.value.stats);
        let loadQueryStats =
          detail.value.stats != undefined && detail.value.stats.enabled && detail.value.features.indexed;
        setDisplayQueryStats(loadQueryStats);
      } else {
        setStatsError(detail.value.message);
      }
    });
  }, [props.display]);

  const buildOperationsPerformanceCard = () => {
    if (!stats) {
      return '';
    }

    return (
      <Card>
        <CardTitle>{t('caches.cache-metrics.performance-title')}</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_read_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
              <MoreInfoTooltip
                label={t('caches.cache-metrics.average-reads')}
                toolTip={t('caches.cache-metrics.average-reads-tooltip')}
              />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_write_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
              <MoreInfoTooltip
                label={t('caches.cache-metrics.average-writes')}
                toolTip={t('caches.cache-metrics.average-writes-tooltip')}
              />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_remove_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
              <MoreInfoTooltip
                label={t('caches.cache-metrics.average-deletes')}
                toolTip={t('caches.cache-metrics.average-deletes-tooltip')}
              />
              </TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const buildQueryStats = () => {
    if (!displayQueryStats) {
      return;
    }
    return (
      <QueryMetrics cacheName={props.cacheName}/>
    );
  };

  const buildDataAccess = () => {
    if (!stats) {
      return '';
    }

    let all =
      stats.hits +
      stats.retrievals +
      stats.remove_hits +
      stats.remove_misses +
      stats.stores +
      stats.misses +
      stats.evictions;

    return (
      <Card>
        <CardTitle>{t('caches.cache-metrics.data-access-title')}</CardTitle>
        <CardBody>
          <div style={{height: '300px', width: '70%'}}>
            <ChartDonut
              constrainToVisibleArea={true}
              data={[
                {x: 'Hits', y: stats.hits},
                {x: 'Misses', y: stats.misses},
                {x: 'Stores', y: stats.stores},
                {x: 'Retrievals', y: stats.retrievals},
                {x: 'Remove Hits', y: stats.remove_hits},
                {x: 'Removes Misses', y: stats.remove_misses},
                {x: 'Evictions', y: stats.evictions},
              ]}
              labels={({datum}) =>
                `${datum.x}:${displayUtils.formatNumber(
                  (datum.y * 100) / all
                )}%`
              }
              legendData={[
                {
                  name: 'Hits: ' + displayUtils.formatNumber(stats.hits),
                },
                {
                  name: 'Misses: ' + displayUtils.formatNumber(stats.misses),
                },
                {
                  name: 'Stores: ' + displayUtils.formatNumber(stats.stores),
                },
                {
                  name:
                    'Retrievals: ' +
                    displayUtils.formatNumber(stats.retrievals),
                },
                {
                  name:
                    'Remove hits: ' +
                    displayUtils.formatNumber(stats.remove_hits),
                },
                {
                  name:
                    'Remove misses: ' +
                    displayUtils.formatNumber(stats.remove_misses),
                },
                {
                  name:
                    'Evictions: ' + displayUtils.formatNumber(stats.evictions),
                },
              ]}
              legendOrientation="vertical"
              legendPosition="right"
              padding={{
                bottom: 40,
                left: 80,
                right: 0, // Adjusted to accommodate legend
                top: 20,
              }}
              title={ displayUtils.formatBigNumber(all) }
              width={600}
              themeColor={ChartThemeColor.multiOrdered}
            />
          </div>
        </CardBody>
        <CardFooter>
        <ExpandableSection toggleTextExpanded={t('caches.cache-metrics.data-access-collapsed')} toggleTextCollapsed={t('caches.cache-metrics.data-access-expanded')}>
        <List>
        <ListItem>{t('caches.cache-metrics.data-access-hits-info')}</ListItem>
        <ListItem>{t('caches.cache-metrics.data-access-misses-info')}</ListItem>
        <ListItem>{t('caches.cache-metrics.data-access-stores-info')}</ListItem>
        <ListItem>{t('caches.cache-metrics.data-access-retrievals-info')}</ListItem>
        <ListItem>{t('caches.cache-metrics.data-access-remove-hits-info')}</ListItem>
        <ListItem>{t('caches.cache-metrics.data-access-remove-misses-info')}</ListItem>
        <ListItem>{t('caches.cache-metrics.data-access-evictions-info')}</ListItem>
        </List>
        </ExpandableSection>
        </CardFooter>
      </Card>
    );
  };

  const buildEntriesCard = () => {
  if (!stats) {
      return '';
    }

    return (
      <Card>
        <CardTitle>{t('caches.cache-metrics.entries-title')}</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem aria-label="view-cache-metrics-size" component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(size)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
              <MoreInfoTooltip
                label={t('caches.cache-metrics.current-number-entries')}
                toolTip={t('caches.cache-metrics.current-number-entries-tooltip')}
              />
              </TextListItem>
              <TextListItem aria-label="view-cache-metrics-nodes" component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.required_minimum_number_of_nodes)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
              <MoreInfoTooltip
              label={t('caches.cache-metrics.min-nodes')}
              toolTip={t('caches.cache-metrics.min-nodes-tooltip')}
              />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>-</TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const buildMemoryCard = () => {
    if (!stats) {
      return '';
    }

    return (
      <Card>
        <CardTitle>{t('caches.cache-metrics.memory-title')}</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem aria-label="view-cache-metrics-off-heap" component={TextListItemVariants.dt}>
                { memory==="OFF_HEAP" ? displayUtils.formatNumber(stats.off_heap_memory_used) : "-" }
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <MoreInfoTooltip
                  label={t('caches.cache-metrics.cache-size-off-heap')}
                  toolTip={memory==="OFF_HEAP" ? '': t('caches.cache-metrics.cache-size-off-heap-tooltip')}
                />
              </TextListItem>
              <TextListItem aria-label="view-cache-metrics-heap" component={TextListItemVariants.dt}>
                { memory==="HEAP" ? displayUtils.formatNumber(stats.data_memory_used) : "-" }
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <MoreInfoTooltip
                  label={t('caches.cache-metrics.cache-size-heap')}
                  toolTip={memory==="HEAP" ? '': t('caches.cache-metrics.cache-size-heap-tooltip')}
                />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>-</TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  if (!stats?.enabled) {
    const message = 'Statistics are disabled.';

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

  if (!props.display) {
    return <span />;
  }

  return (
    <Grid hasGutter={true}>
      <GridItem span={4}>{buildEntriesCard()}</GridItem>
      <GridItem span={4}>{buildMemoryCard()}</GridItem>
      <GridItem span={4}>{buildOperationsPerformanceCard()}</GridItem>
      <GridItem span={12}>{buildDataAccess()}</GridItem>
      <GridItem span={12}>{buildQueryStats()}</GridItem>
    </Grid>
  );
}

export { CacheMetrics };
