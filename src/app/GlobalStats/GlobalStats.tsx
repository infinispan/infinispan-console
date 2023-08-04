import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants, EmptyStateHeader,
  
} from '@patternfly/react-core';
import { ArrowIcon, CubesIcon, RedoIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import displayUtils from '@services/displayUtils';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useFetchGlobalStats } from '@app/services/statsHook';
import { useTranslation } from 'react-i18next';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import ClusterDistributionChart from '@app/GlobalStats/ClusterDistributionChart';
import { global_spacer_sm } from '@patternfly/react-tokens';

const GlobalStats = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { stats, error, loading, reload } = useFetchGlobalStats();

  const allOps = () => {
    return stats.hits + stats.misses + stats.remove_hits + stats.remove_misses + stats.stores + stats.evictions;
    if (stats?.statistics_enabled) {
    }
    return 0;
  };

  const clusterStatsCard = () => {
    return (
      <Card isFullHeight>
        <CardTitle>
          <Level>
            <LevelItem>
              <PopoverHelp
                name="cluster-wide-stats"
                label={t('global-stats.cluster-wide-stats')}
                content={t('global-stats.cluster-wide-stats-tooltip')}
                text={t('global-stats.cluster-wide-stats')}
              />
            </LevelItem>
            <LevelItem>
              <Link to={{ pathname: '/', search: location.search }}>
                <Button data-cy="viewCachesLink" variant={ButtonVariant.link} icon={<ArrowIcon />}>
                  {t('global-stats.view-caches-link')}
                </Button>
              </Link>
            </LevelItem>
          </Level>
        </CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.number_of_entries)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.no-of-entries')}</TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.current_number_of_entries_in_memory)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {t('global-stats.current-entry-in-memory')}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.total_number_of_entries)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.total-no-entries')}</TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.data_memory_used)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.data-memory-used')}</TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.off_heap_memory_used)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.off-heap-memory-used')}</TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const displayAccessStats = (name: string, value: number, label: string, tooltip: string) => {
    return (
      <React.Fragment>
        <TextListItem component={TextListItemVariants.dt} data-cy={label.replace(/\s/g, '') + 'Val'}>
          {displayUtils.formatNumber(value)}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          <PopoverHelp name={name} label={label} content={tooltip} text={label} />
        </TextListItem>
      </React.Fragment>
    );
  };

  const dataAccessCard = () => {
    return (
      <Card>
        <CardTitle>{t('global-stats.data-access-stats')}</CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>{displayUtils.formatBigNumber(allOps())}</TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <Text component="h5">{t('caches.cache-metrics.data-total')}</Text>
              </TextListItem>
            </TextList>
          </TextContent>
          <Divider component="div" style={{ padding: '10px 0' }} />
          <TextContent>
            <TextList component={TextListVariants.dl}>
              {displayAccessStats(
                'hits',
                stats.hits,
                t('global-stats.data-access-hits'),
                t('global-stats.data-access-hits-info')
              )}
              {displayAccessStats(
                'misses',
                stats.misses,
                t('global-stats.data-access-misses'),
                t('global-stats.data-access-misses-info')
              )}
              {displayAccessStats(
                'stores',
                stats.stores,
                t('global-stats.data-access-stores'),
                t('global-stats.data-access-stores-info')
              )}
              {displayAccessStats(
                'remove_hits',
                stats.remove_hits,
                t('global-stats.data-access-remove-hits'),
                t('global-stats.data-access-remove-hits-info')
              )}
              {displayAccessStats(
                'remove_misses',
                stats.remove_misses,
                t('global-stats.data-access-remove-misses'),
                t('global-stats.data-access-remove-misses-info')
              )}
              {displayAccessStats(
                'evictions',
                stats.evictions,
                t('global-stats.data-access-evictions'),
                t('global-stats.data-access-evictions-info')
              )}
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const operationPerformanceCard = () => {
    return (
      <Card isFullHeight>
        <CardTitle>
          <PopoverHelp
            name={'operation-performance-values'}
            label={t('global-stats.operation-performance-values')}
            content={t('global-stats.operation-performance-values-tooltip')}
            text={t('global-stats.operation-performance-values')}
          />
        </CardTitle>
        <CardBody>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_read_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.average-reads')}</TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_remove_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.average-writes')}</TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.average_write_time)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.average-removes')}</TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.read_write_ratio)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {t('global-stats.average-read-write-ratio')}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.hit_ratio)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{t('global-stats.average-hits-ratio')}</TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const cacheManagerLifecycleCard = () => {
    return (
      <Card isFullHeight>
        <CardTitle>
          <Level>
            <LevelItem>
              <PopoverHelp
                name={'cache-manager-lifecycle-values'}
                label={t('global-stats.cache-manager-lifecycle')}
                content={t('global-stats.cache-manager-lifecycle-tooltip')}
                text={t('global-stats.cache-manager-lifecycle')}
              />
            </LevelItem>
            <LevelItem>
              <Link to={{ pathname: '/cluster-membership', search: location.search }}>
                <Button data-cy="viewClustersLink" variant={ButtonVariant.link} icon={<ArrowIcon />}>
                  {t('global-stats.view-cluster-membership-link')}
                </Button>
              </Link>
            </LevelItem>
          </Level>
        </CardTitle>
        <CardBody>
          <TextContent style={{ height: '208px' }}>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.time_since_start)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {t('global-stats.cache-manager-start-time')}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {displayUtils.formatNumber(stats.time_since_reset)}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {t('global-stats.cache-manager-reset-time')}
              </TextListItem>
            </TextList>
          </TextContent>
        </CardBody>
      </Card>
    );
  };

  const buildStats = () => {
    if (loading && !error) {
      return (
        <Card>
          <CardBody>
            <Spinner size="xl" />
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardBody>
            <TableErrorState error={error} />
          </CardBody>
        </Card>
      );
    }

    if (!loading && !error && !stats.statistics_enabled) {
      return (
        <Card>
          <CardBody>
            <EmptyState variant={EmptyStateVariant.full}>
              <EmptyStateHeader titleText={<>{t('global-stats.global-stats-disabled')}</>} icon={<EmptyStateIcon icon={CubesIcon} />} headingLevel="h5" />
              <EmptyStateBody>{t('global-stats.global-stats-disabled-help')}</EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return (
      <Grid hasGutter={true}>
        <GridItem span={4} rowSpan={1}>
          {clusterStatsCard()}
        </GridItem>
        <GridItem span={4} rowSpan={1}>
          {operationPerformanceCard()}
        </GridItem>
        <GridItem span={4} rowSpan={1}>
          {cacheManagerLifecycleCard()}
        </GridItem>
        <GridItem span={8}>
          <ClusterDistributionChart />
        </GridItem>
        <GridItem span={4}>{dataAccessCard()}</GridItem>
      </Grid>
    );
  };

  const descriptionText = () => {
    if (stats.statistics_enabled) {
      return t('global-stats.global-stats-enable-msg');
    } else {
      return t('global-stats.global-stats-disable-msg');
    }
  };

  const buildRefreshButton = (
    <Button
      style={{ paddingLeft: '0' }}
      type="button"
      aria-label={t('caches.actions.refresh')}
      variant="link"
      onClick={reload}
      icon={<RedoIcon />}
      iconPosition="left"
    >
      {t('caches.actions.refresh')}
    </Button>
  );

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Stack>
          <StackItem>
            <TextContent>
              <Text component={TextVariants.h1}>{t('global-stats.title')}</Text>
              <Text component={TextVariants.p}>{descriptionText()}</Text>
            </TextContent>
          </StackItem>
          <StackItem style={{ marginTop: global_spacer_sm.var }}>{buildRefreshButton}</StackItem>
        </Stack>
      </PageSection>
      <PageSection>{buildStats()}</PageSection>
    </React.Fragment>
  );
};

export { GlobalStats };
