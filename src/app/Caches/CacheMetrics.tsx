import React, { useEffect, useState } from 'react';
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
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { CubesIcon } from '@patternfly/react-icons';
import { QueryMetrics } from '@app/Caches/Query/QueryMetrics';
import { DataDistribution } from '@app/Caches/DataDistribution';
import { ConsoleServices } from "@services/ConsoleServices";
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { ExpandableSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { StorageType } from "@services/infinispanRefData";

const CacheMetrics = (props: { cacheName: string; display: boolean }) => {
  const [stats, setStats] = useState<CacheStats | undefined>(undefined);
  const [statsError, setStatsError] = useState<string | undefined>(undefined);
  const [displayQueryStats, setDisplayQueryStats] = useState<boolean>(false);
  const [size, setSize] = useState<number | undefined>(0)
  const [memory, setMemory] = useState<string | undefined>(undefined)
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  useEffect(() => {
    ConsoleServices.caches().retrieveFullDetail(props.cacheName).then((detail) => {
      if (detail.isRight()) {

        // Load the memory storage and size eviction
        const loadMemory = JSON.parse(detail.value.configuration.config)[props.cacheName]
        const cacheMode = Object.keys(loadMemory)[0]
        if(loadMemory[cacheMode].memory){
          if(loadMemory[cacheMode].memory.storage==="HEAP" && loadMemory[cacheMode].memory["max-size"])
            setMemory(loadMemory[cacheMode].memory.storage)
          else if(loadMemory[cacheMode].memory.storage==="OFF_HEAP")
            setMemory(loadMemory[cacheMode].memory.storage)
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
                <PopoverHelp
                  name='average-reads'
                  label={t('caches.cache-metrics.average-reads')}
                  content={t('caches.cache-metrics.average-reads-tooltip')}
                  text={t('caches.cache-metrics.average-reads')}
                />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_write_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name='average-writes'
                  label={t('caches.cache-metrics.average-writes')}
                  content={t('caches.cache-metrics.average-writes-tooltip')}
                  text={t('caches.cache-metrics.average-writes')}
                />
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_remove_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name='average-deletes'
                  label={t('caches.cache-metrics.average-deletes')}
                  content={t('caches.cache-metrics.average-deletes-tooltip')}
                  text={t('caches.cache-metrics.average-deletes')}
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
      <QueryMetrics cacheName={props.cacheName} />
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
          <div style={{ height: '300px', width: '70%' }}>
            <ChartDonut
              constrainToVisibleArea={true}
              data={[
                { x: t('caches.cache-metrics.data-access-hits'), y: stats.hits },
                { x: t('caches.cache-metrics.data-access-misses'), y: stats.misses },
                { x: t('caches.cache-metrics.data-access-stores'), y: stats.stores },
                { x: t('caches.cache-metrics.data-access-retrievals'), y: stats.retrievals },
                { x: t('caches.cache-metrics.data-access-remove-hits'), y: stats.remove_hits },
                { x: t('caches.cache-metrics.data-access-remove-misses'), y: stats.remove_misses },
                { x: t('caches.cache-metrics.data-access-evictions'), y: stats.evictions },
              ]}
              labels={({ datum }) =>
                `${datum.x}:${displayUtils.formatNumber(
                  (datum.y * 100) / all
                )}%`
              }
              legendData={[
                {
                  name: t('caches.cache-metrics.data-access-hits') + ': ' + displayUtils.formatNumber(stats.hits),
                },
                {
                  name: t('caches.cache-metrics.data-access-misses') + ': ' + displayUtils.formatNumber(stats.misses),
                },
                {
                  name: t('caches.cache-metrics.data-access-stores') + ': ' + displayUtils.formatNumber(stats.stores),
                },
                {
                  name:
                    t('caches.cache-metrics.data-access-retrievals') + ': ' +
                    displayUtils.formatNumber(stats.retrievals),
                },
                {
                  name:
                    t('caches.cache-metrics.data-access-remove-hits') + ': ' +
                    displayUtils.formatNumber(stats.remove_hits),
                },
                {
                  name:
                    t('caches.cache-metrics.data-access-remove-misses') + ': ' +
                    displayUtils.formatNumber(stats.remove_misses),
                },
                {
                  name:
                    t('caches.cache-metrics.data-access-evictions') + ': ' + displayUtils.formatNumber(stats.evictions),
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
              title={displayUtils.formatBigNumber(all)}
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
                <PopoverHelp
                  name='current-number-entries'
                  label={t('caches.cache-metrics.current-number-entries')}
                  content={t('caches.cache-metrics.current-number-entries-tooltip')}
                  text={t('caches.cache-metrics.current-number-entries')}
                />
              </TextListItem>
              <TextListItem aria-label="view-cache-metrics-nodes" component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.required_minimum_number_of_nodes)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name='min-nodes'
                  label={t('caches.cache-metrics.min-nodes')}
                  content={t('caches.cache-metrics.min-nodes-tooltip')}
                  text={t('caches.cache-metrics.min-nodes')}
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
                {memory === StorageType.OFF_HEAP ? displayUtils.formatNumber(stats.off_heap_memory_used) : "-"}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name='cache-size-off-heap'
                  label={t('caches.cache-metrics.cache-size-off-heap')}
                  content={memory === StorageType.OFF_HEAP ? '' : t('caches.cache-metrics.cache-size-off-heap-tooltip')}
                  text={t('caches.cache-metrics.cache-size-off-heap')}
                />
              </TextListItem>
              <TextListItem aria-label="view-cache-metrics-heap" component={TextListItemVariants.dt}>
                {memory === StorageType.HEAP ? displayUtils.formatNumber(stats.data_memory_used) : "-"}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <PopoverHelp
                  name='cache-size-heap'
                  label={t('caches.cache-metrics.cache-size-heap')}
                  content={memory === StorageType.HEAP ? '' : t('caches.cache-metrics.cache-size-heap-tooltip')}
                  text={t('caches.cache-metrics.cache-size-heap')}
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
      <GridItem span={12}><DataDistribution cacheName={props.cacheName} /></GridItem>
      <GridItem span={12}>{buildDataAccess()}</GridItem>
      <GridItem span={12}>{buildQueryStats()}</GridItem>
    </Grid>
  );
}

export { CacheMetrics };
