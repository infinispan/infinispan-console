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
  TextVariants,
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { TableErrorState } from '@app/Common/TableErrorState';
import { ClearQueryMetrics } from '@app/Caches/Query/ClearQueryMetrics';
import cacheService from '../../../services/cacheService';

/**
 * Query stats for indexed caches only
 */
const QueryMetrics = (props: {
  cacheName: string;
  stats: QueryStats | undefined;
  loading: boolean;
  error: string;
}) => {
  const [stats, setStats] = useState<QueryStats | undefined>(props.stats);
  const [loading, setLoading] = useState<boolean>(props.loading);
  const [error, setError] = useState<string>(props.error);

  const [isClearMetricsModalOpen, setClearMetricsModalOpen] = useState<boolean>(
    false
  );

  const closeClearMetricsModal = () => {
    setClearMetricsModalOpen(false);
    realoadStats();
  };

  const realoadStats = () => {
    cacheService.retrieveQueryStats(props.cacheName).then((eitherStats) => {
      setLoading(false);
      if (eitherStats.isRight()) {
        setStats(eitherStats.value);
      } else {
        setError(eitherStats.value.message);
      }
    });
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
        <Text component={TextVariants.small}>
          {' '}
          Search query <Divider component={DividerVariant.hr} />
        </Text>
        <TextList component={TextListVariants.dl}>
          <TextListItem
            component={TextListItemVariants.dt}
            style={{ width: 250 }}
          >
            Execution count
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(stats?.search_query_execution_count)}
          </TextListItem>

          <TextListItem component={TextListItemVariants.dt}>
            Total time
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(stats?.search_query_total_time)}
          </TextListItem>

          <TextListItem component={TextListItemVariants.dt}>
            Execution max time
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(stats?.search_query_execution_max_time)}
          </TextListItem>

          <TextListItem component={TextListItemVariants.dt}>
            Execution avg time
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(stats?.search_query_execution_avg_time)}
          </TextListItem>

          <TextListItem component={TextListItemVariants.dt}>
            Execution max time query string
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {stats?.search_query_execution_max_time_query_string}
          </TextListItem>
        </TextList>
        <Text component={TextVariants.small}>
          {' '}
          Object loading <Divider component={DividerVariant.hr} />
        </Text>
        <TextList component={TextListVariants.dl}>
          <TextListItem
            component={TextListItemVariants.dt}
            style={{ width: 250 }}
          >
            Total time
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(stats?.object_loading_total_time)}
          </TextListItem>

          <TextListItem component={TextListItemVariants.dt}>
            Execution max time
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(
              stats?.object_loading_execution_max_time
            )}
          </TextListItem>

          <TextListItem component={TextListItemVariants.dt}>
            Execution avg time
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(
              stats?.object_loading_execution_avg_time
            )}
          </TextListItem>

          <TextListItem component={TextListItemVariants.dt}>Count</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            {displayUtils.formatNumber(stats?.objects_loaded_count)}
          </TextListItem>
        </TextList>
      </TextContent>
    );
  };

  return (
    <Card>
      <CardTitle>
        <Level id={'query-stats'}>
          <LevelItem>Query stats</LevelItem>
          <LevelItem>
            <Button
              variant={ButtonVariant.danger}
              onClick={() => setClearMetricsModalOpen(true)}
            >
              Clear all stats
            </Button>
            <ClearQueryMetrics
              cacheName={props.cacheName}
              isModalOpen={isClearMetricsModalOpen}
              closeModal={closeClearMetricsModal}
            />
          </LevelItem>
        </Level>
      </CardTitle>
      <CardBody>{buildCardContent()}</CardBody>
    </Card>
  );
};

export { QueryMetrics };
