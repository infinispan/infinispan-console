import * as React from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
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
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { ArrowIcon, CubesIcon } from '@patternfly/react-icons';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { Link } from 'react-router-dom';
import displayUtils from '@services/displayUtils';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useFetchGlobalStats } from '@app/services/statsHook';
import { useTranslation } from 'react-i18next';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import ClusterDistributionChart from '@app/GlobalStats/ClusterDistributionChart';

const GlobalStats = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { stats, error, loading } = useFetchGlobalStats();

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
              <Link to={{ pathname: '/' }}>
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

  const dataAccessCard = () => {
    return (
      <Card>
        <CardTitle>
          <PopoverHelp
            name={'data-access-statistics'}
            label={t('global-stats.data-access-stats')}
            content={t('global-stats.data-access-stats-tooltip')}
            text={t('global-stats.data-access-stats')}
          />
        </CardTitle>
        <CardBody>
          <div style={{ width: '100%', height: '480px' }}>
            <ChartDonut
              width={600}
              height={400}
              constrainToVisibleArea={true}
              data={[
                { x: t('global-stats.data-access-hits'), y: stats.hits },
                { x: t('global-stats.data-access-misses'), y: stats.misses },
                { x: t('global-stats.data-access-stores'), y: stats.stores },
                {
                  x: t('global-stats.data-access-remove-hits'),
                  y: stats.remove_hits
                },
                {
                  x: t('global-stats.data-access-remove-misses'),
                  y: stats.remove_misses
                },
                {
                  x: t('global-stats.data-access-evictions'),
                  y: stats.evictions
                }
              ]}
              labels={({ datum }) => `${datum.x}: ${displayUtils.formatNumber((datum.y * 100) / allOps())}%`}
              legendData={[
                {
                  name: t('global-stats.data-access-hits') + ': ' + displayUtils.formatNumber(stats.hits)
                },
                {
                  name: t('global-stats.data-access-misses') + ': ' + displayUtils.formatNumber(stats.misses)
                },
                {
                  name: t('global-stats.data-access-stores') + ': ' + displayUtils.formatNumber(stats.stores)
                },
                {
                  name: t('global-stats.data-access-remove-hits') + ': ' + displayUtils.formatNumber(stats.remove_hits)
                },
                {
                  name:
                    t('global-stats.data-access-remove-misses') + ': ' + displayUtils.formatNumber(stats.remove_misses)
                },
                {
                  name: t('global-stats.data-access-evictions') + ': ' + displayUtils.formatNumber(stats.evictions)
                }
              ]}
              legendOrientation="vertical"
              legendPosition="bottom"
              padding={{
                bottom: 160,
                left: 0,
                right: 0, // Adjusted to accommodate legend
                top: 0
              }}
              subTitle={t('global-stats.data-access-subtitle')}
              title={displayUtils.formatBigNumber(allOps())}
              themeColor={ChartThemeColor.multiOrdered}
            />
          </div>
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
              <Link to={{ pathname: '/cluster-membership' }}>
                <Button variant={ButtonVariant.link} icon={<ArrowIcon />}>
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
              <EmptyStateIcon icon={CubesIcon} />
              <Title headingLevel="h5" size="lg">
                {t('global-stats.global-stats-disabled')}
              </Title>
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
        <GridItem span={7}>
          <ClusterDistributionChart />
        </GridItem>
        <GridItem span={5}>{dataAccessCard()}</GridItem>
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

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component={TextVariants.h1}>{t('global-stats.title')}</Text>
          <Text component={TextVariants.p}>{descriptionText()}</Text>
        </TextContent>
      </PageSection>
      <PageSection>{buildStats()}</PageSection>
    </React.Fragment>
  );
};

export { GlobalStats };
