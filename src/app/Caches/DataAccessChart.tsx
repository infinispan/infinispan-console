import React from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  ExpandableSection,
  List,
  ListComponent,
  ListItem, OrderType
} from '@patternfly/react-core';
import {ChartDonut, ChartThemeColor} from '@patternfly/react-charts';
import {useTranslation} from 'react-i18next';
import displayUtils from "@services/displayUtils";
import {PopoverHelp} from "@app/Common/PopoverHelp";

const DataAccessChart = (props: {
    stats: CacheStats;
}) => {
    const { t } = useTranslation();
    const brandname = t('brandname.brandname');
    const all =
      props.stats.hits +
      props.stats.retrievals +
      props.stats.remove_hits +
      props.stats.remove_misses +
      props.stats.stores +
      props.stats.misses +
      props.stats.evictions;

  return (
    <Card>
      <CardTitle>
        <PopoverHelp name={'pop-over-data-access-chart-help'}
                     label={t('caches.cache-metrics.data-access-title')}
                     text={t('caches.cache-metrics.data-access-title')}
                     content={
                      <List component={ListComponent.ol} type={OrderType.number}>
                         <ListItem>{t('caches.cache-metrics.data-access-hits-info')}</ListItem>
                         <ListItem>{t('caches.cache-metrics.data-access-misses-info')}</ListItem>
                         <ListItem>{t('caches.cache-metrics.data-access-stores-info')}</ListItem>
                         <ListItem>{t('caches.cache-metrics.data-access-retrievals-info')}</ListItem>
                         <ListItem>{t('caches.cache-metrics.data-access-remove-hits-info')}</ListItem>
                         <ListItem>{t('caches.cache-metrics.data-access-remove-misses-info')}</ListItem>
                         <ListItem>{t('caches.cache-metrics.data-access-evictions-info')}</ListItem>
                      </List>}
        />
      </CardTitle>
      <CardBody>
        <div style={{ width: '100%', height:'480px' }}>
          <ChartDonut
            width={600}
            height={400}
            constrainToVisibleArea={true}
            data={[
              { x: t('caches.cache-metrics.data-access-hits'), y: props.stats.hits },
              { x: t('caches.cache-metrics.data-access-misses'), y: props.stats.misses },
              { x: t('caches.cache-metrics.data-access-stores'), y: props.stats.stores },
              { x: t('caches.cache-metrics.data-access-retrievals'), y: props.stats.retrievals },
              { x: t('caches.cache-metrics.data-access-remove-hits'), y: props.stats.remove_hits },
              { x: t('caches.cache-metrics.data-access-remove-misses'), y: props.stats.remove_misses },
              { x: t('caches.cache-metrics.data-access-evictions'), y: props.stats.evictions },
            ]}
            labels={({ datum }) =>
              `${datum.x}:${displayUtils.formatNumber(
                (datum.y * 100) / all
              )}%`
            }
            legendData={[
              {
                name: t('caches.cache-metrics.data-access-hits') + ': ' + displayUtils.formatNumber(props.stats.hits),
              },
              {
                name: t('caches.cache-metrics.data-access-misses') + ': ' + displayUtils.formatNumber(props.stats.misses),
              },
              {
                name: t('caches.cache-metrics.data-access-stores') + ': ' + displayUtils.formatNumber(props.stats.stores),
              },
              {
                name:
                  t('caches.cache-metrics.data-access-retrievals') + ': ' +
                  displayUtils.formatNumber(props.stats.retrievals),
              },
              {
                name:
                  t('caches.cache-metrics.data-access-remove-hits') + ': ' +
                  displayUtils.formatNumber(props.stats.remove_hits),
              },
              {
                name:
                  t('caches.cache-metrics.data-access-remove-misses') + ': ' +
                  displayUtils.formatNumber(props.stats.remove_misses),
              },
              {
                name:
                  t('caches.cache-metrics.data-access-evictions') + ': ' + displayUtils.formatNumber(props.stats.evictions),
              },
            ]}
            legendOrientation={'vertical'}
            legendPosition={'bottom'}
            padding={{
              bottom: 160,
              left: 0,
              right: 0, // Adjusted to accommodate legend
              top: 0,
            }}
            title={displayUtils.formatBigNumber(all)}
            themeColor={ChartThemeColor.multiOrdered}
          />
        </div>
      </CardBody>
    </Card>
    );
};

export { DataAccessChart };
