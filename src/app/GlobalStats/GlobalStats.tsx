import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Spinner,
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
import { useConnectedUser } from '@app/services/userManagementHook';
import { PageHeader } from '@patternfly/react-component-groups';

const GlobalStats = () => {
  const { t } = useTranslation();
  const { stats, error, loading, reload } = useFetchGlobalStats();
  const { connectedUser } = useConnectedUser();
  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const clusterStatsCard = () => {
    return (
      <Card isFullHeight>
        <CardTitle>
          <PopoverHelp
            name="cluster-wide-stats"
            label={t('global-stats.cluster-wide-stats')}
            content={t('global-stats.cluster-wide-stats-tooltip')}
            text={t('global-stats.cluster-wide-stats')}
          />
        </CardTitle>
        <CardBody>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>
              {displayUtils.formatNumber(stats.required_minimum_number_of_nodes)}
            </Content>
            <Content component={ContentVariants.dd}>{t('global-stats.required-minimum-number-of-nodes')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.data_memory_used)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.data-memory-used')}</Content>
            <Content component={ContentVariants.dt}>{displayUtils.formatNumber(stats.off_heap_memory_used)}</Content>
            <Content component={ContentVariants.dd}>{t('global-stats.off-heap-memory-used')}</Content>
          </Content>
        </CardBody>
        <CardFooter>
          <Link to={{ pathname: '/', search: location.search }}>
            <Button data-cy="viewCachesLink" variant={ButtonVariant.link} icon={<ArrowIcon />}>
              {t('global-stats.view-caches-link')}
            </Button>
          </Link>
        </CardFooter>
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
            <EmptyState
              variant={EmptyStateVariant.full}
              titleText={<>{t('global-stats.global-stats-disabled')}</>}
              icon={CubesIcon}
              headingLevel="h5"
            >
              <EmptyStateBody>{t('global-stats.global-stats-disabled-help')}</EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return (
      <Grid hasGutter={true}>
        <GridItem span={4}>{clusterStatsCard()}</GridItem>
        <GridItem span={8}>
          <ClusterDistributionChart />
        </GridItem>
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
    <ToolbarGroup align={{ default: 'alignEnd' }}>
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
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );

  return (
    <React.Fragment>
      <PageHeader title={t('global-stats.title')} subtitle={descriptionText()} actionMenu={displayActions} />
      <PageSection>{buildStats()}</PageSection>
    </React.Fragment>
  );
};

export { GlobalStats };
