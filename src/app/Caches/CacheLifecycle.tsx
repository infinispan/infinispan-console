import React from 'react';
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
  TextListItemVariants
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import displayUtils from '@services/displayUtils';
import { global_spacer_sm } from '@patternfly/react-tokens';

const CacheLifecycle = (props: { stats: CacheStats }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

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

  return (
    <Card>
      <CardTitle>{t('caches.cache-metrics.cache-lifecycle-title')}</CardTitle>
      <CardBody>
        <TextContent>
          <TextList component={TextListVariants.dl}>
            {displayStats(
              'started-since',
              props.stats.time_since_start,
              t('caches.cache-metrics.cache-started-since'),
              t('caches.cache-metrics.cache-started-since-info')
            )}
            {displayStats(
              'reset-since',
              props.stats.time_since_reset,
              t('caches.cache-metrics.cache-reset-since'),
              t('caches.cache-metrics.cache-reset-since-info')
            )}
          </TextList>
        </TextContent>
      </CardBody>
    </Card>
  );
};

export { CacheLifecycle };
