import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Level,
  LevelItem,
  MenuToggle,
  MenuToggleElement,
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
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { ArrowIcon, CubesIcon, RedoIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import displayUtils from '@services/displayUtils';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useFetchGlobalStats } from '@app/services/statsHook';
import { useTranslation } from 'react-i18next';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import ClusterDistributionChart from '@app/GlobalStats/ClusterDistributionChart';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { ClearMetrics } from '@app/ClearMetrics/ClearMetrics';
import { useConnectedUser } from '@app/services/userManagementHook';

const GlobalStats = () => {
  const { t } = useTranslation();
  const { stats, error, loading, reload } = useFetchGlobalStats();
  const { connectedUser } = useConnectedUser();
  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const allOps = () => {
    return stats.hits + stats.misses + stats.remove_hits + stats.remove_misses + stats.stores + stats.evictions;
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

  const buildClearStatsItem = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return '';
    }

    return (
      <React.Fragment>
        <Divider component="li" />
        <DropdownItem
          value={0}
          key="clearAccessMetricsButton"
          data-cy="clearAccessMetricsButton"
          onClick={() => setClearMetricsModalOpen(true)}
        >
          {t('caches.cache-metrics.button-clear-access-stats')}
        </DropdownItem>
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
              <EmptyStateHeader
                titleText={<>{t('global-stats.global-stats-disabled')}</>}
                icon={<EmptyStateIcon icon={CubesIcon} />}
                headingLevel="h5"
              />
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

  const displayActions = (
    <ToolbarGroup align={{ default: 'alignRight' }}>
      <ToolbarItem>
        <Dropdown
          isOpen={isOpen}
          popperProps={{ position: 'right' }}
          onSelect={() => setIsOpen(false)}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              data-cy="globalStatsActions"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
            >
              {t('common.actions.actions')}
            </MenuToggle>
          )}
          ouiaId="globalAccessDropdown"
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            <DropdownItem value={0} key="refreshAction" data-cy="refreshAction" onClick={reload} icon={<RedoIcon />}>
              {t('common.actions.refresh')}
            </DropdownItem>
            {buildClearStatsItem()}
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Toolbar id="global-stats-header">
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <TextContent>
                  <Text component={TextVariants.h1}>{t('global-stats.title')}</Text>
                  <Text component={TextVariants.p}>{descriptionText()}</Text>
                </TextContent>
              </ToolbarItem>
            </ToolbarGroup>
            {displayActions}
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <PageSection>{buildStats()}</PageSection>
      <ClearMetrics
        name={'cm'}
        isModalOpen={isClearMetricsModalOpen}
        closeModal={() => {
          reload();
          setClearMetricsModalOpen(false);
        }}
        type={'global-stats'}
      />
    </React.Fragment>
  );
};

export { GlobalStats };
