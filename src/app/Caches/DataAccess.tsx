import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  TextContent,
  Text,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
  LevelItem,
  Level,
  Button,
  ButtonVariant
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import displayUtils from '@services/displayUtils';
import { global_spacer_sm } from '@patternfly/react-tokens';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { ClearMetrics } from '@app/ClearMetrics/ClearMetrics';
import { useConnectedUser } from '@app/services/userManagementHook';

const DataAccess = (props: { cacheName: string; stats: CacheStats }) => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(false);

  const all =
    props.stats.hits +
    props.stats.retrievals +
    props.stats.remove_hits +
    props.stats.remove_misses +
    props.stats.stores +
    props.stats.misses +
    props.stats.evictions;

  const displayStats = (name: string, value: number, label: string, tooltip: string) => {
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

  const buildClearStatsButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return '';
    }

    return (
      <LevelItem>
        <Button
          data-cy="clearAccessMetricsButton"
          variant={ButtonVariant.danger}
          onClick={() => setClearMetricsModalOpen(true)}
        >
          {t('caches.cache-metrics.button-clear-access-stats')}
        </Button>
        <ClearMetrics
          name={props.cacheName}
          isModalOpen={isClearMetricsModalOpen}
          closeModal={() => setClearMetricsModalOpen(false)}
          type={'cache-metrics'}
        />
      </LevelItem>
    );
  };

  return (
    <Card>
      <CardTitle>
        <Level id={'access-stats'}>
          <LevelItem>{t('caches.cache-metrics.data-access-title')}</LevelItem>
          {buildClearStatsButton()}
        </Level>
      </CardTitle>
      <CardBody>
        <TextContent>
          <TextList component={TextListVariants.dl}>
            <TextListItem component={TextListItemVariants.dt}>{all}</TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              <Text component="h5">{t('caches.cache-metrics.data-total')}</Text>
            </TextListItem>
          </TextList>
        </TextContent>
        <Divider
          component="div"
          style={{ paddingTop: global_spacer_sm.value, paddingBottom: global_spacer_sm.value }}
        />
        <TextContent>
          <TextList component={TextListVariants.dl}>
            {displayStats(
              'hits',
              props.stats.hits,
              t('caches.cache-metrics.data-access-hits'),
              t('caches.cache-metrics.data-access-hits-info')
            )}
            {displayStats(
              'misses',
              props.stats.misses,
              t('caches.cache-metrics.data-access-misses'),
              t('caches.cache-metrics.data-access-misses-info')
            )}
            {displayStats(
              'stores',
              props.stats.stores,
              t('caches.cache-metrics.data-access-stores'),
              t('caches.cache-metrics.data-access-stores-info')
            )}
            {displayStats(
              'retrievals',
              props.stats.retrievals,
              t('caches.cache-metrics.data-access-retrievals'),
              t('caches.cache-metrics.data-access-retrievals-info')
            )}
            {displayStats(
              'remove_hits',
              props.stats.remove_hits,
              t('caches.cache-metrics.data-access-remove-hits'),
              t('caches.cache-metrics.data-access-remove-hits-info')
            )}
            {displayStats(
              'remove_misses',
              props.stats.remove_misses,
              t('caches.cache-metrics.data-access-remove-misses'),
              t('caches.cache-metrics.data-access-remove-misses-info')
            )}
            {displayStats(
              'evictions',
              props.stats.evictions,
              t('caches.cache-metrics.data-access-evictions'),
              t('caches.cache-metrics.data-access-evictions-info')
            )}
          </TextList>
        </TextContent>
      </CardBody>
    </Card>
  );
};

export { DataAccess };
