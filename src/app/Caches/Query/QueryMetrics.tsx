import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Divider,
  DividerVariant,
  Level,
  LevelItem,
  Spinner,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants
} from '@patternfly/react-core';
import { TableErrorState } from '@app/Common/TableErrorState';
import { ClearQueryMetrics } from '@app/Caches/Query/ClearQueryMetrics';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { useSearchStats } from '@app/services/statsHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';

/**
 * Query stats for indexed caches only
 */
const QueryMetrics = (props: { cacheName: string }) => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { stats, loading, error, setLoading } = useSearchStats(props.cacheName);

  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(false);

  const closeClearMetricsModal = () => {
    setClearMetricsModalOpen(false);
    setLoading(true);
  };

  const buildCardContent = () => {
    if (loading && !stats) {
      return <Spinner size={'sm'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    return (
      <TextContent>
        {stats.query.map((queryStat, num) => (
          <React.Fragment key={'stat-fragment-' + num}>
            <Text component={TextVariants.small} key={'name-' + num}>
              {' '}
              {queryStat.name} <Divider component={DividerVariant.hr} />
            </Text>
            <TextList component={TextListVariants.dl} key={'stats-' + num}>
              <TextListItem component={TextListItemVariants.dt} style={{ width: 250 }} key={'stats-count-label-' + num}>
                {t('caches.query.stat-count')}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd} key={'stats-count-value-' + num}>
                {queryStat.count}
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                style={{ width: 250 }}
                key={'stats-qverage-label-' + num}
              >
                {t('caches.query.stat-average')}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd} key={'stats-average-value-' + num}>
                {queryStat.average}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt} style={{ width: 250 }} key={'stats-max-label-' + num}>
                {t('caches.query.stat-max')}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd} key={'stats-max-value-' + num}>
                {queryStat.max}
              </TextListItem>
              {displaySlowest(queryStat, num)}
            </TextList>
          </React.Fragment>
        ))}
      </TextContent>
    );
  };

  const displaySlowest = (queryStat: QueryStat, num: number) => {
    if (!queryStat.slowest || queryStat.slowest == '') {
      return '';
    }
    return (
      <React.Fragment>
        <TextListItem component={TextListItemVariants.dt} style={{ width: 250 }} key={'stats-slowest-label-' + num}>
          {t('caches.query.stat-slowest')}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd} key={'stats-slowest-value-' + num}>
          <code>{queryStat.slowest}</code>
        </TextListItem>
      </React.Fragment>
    );
  };

  const buildClearStatsButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return '';
    }

    return (
      <LevelItem>
        <Button
          data-cy="clearQueryMetricsButton"
          variant={ButtonVariant.danger}
          onClick={() => setClearMetricsModalOpen(true)}
        >
          {t('caches.query.button-clear-query-stats')}
        </Button>
        <ClearQueryMetrics
          cacheName={props.cacheName}
          isModalOpen={isClearMetricsModalOpen}
          closeModal={closeClearMetricsModal}
        />
      </LevelItem>
    );
  };

  return (
    <Card>
      <CardTitle>
        <Level id={'query-stats'}>
          <LevelItem>
            <PopoverHelp
              name="query-metrics"
              label={t('caches.query.query-metrics-title')}
              content={t('caches.query.query-metrics-tooltip')}
              text={t('caches.query.query-metrics-title')}
            />
          </LevelItem>
          {buildClearStatsButton()}
        </Level>
      </CardTitle>
      <CardBody>{buildCardContent()}</CardBody>
    </Card>
  );
};

export { QueryMetrics };
