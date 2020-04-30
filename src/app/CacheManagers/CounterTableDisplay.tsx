import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import {
  Badge,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Pagination,
  Stack,
  StackItem,
  Title
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import displayUtils from '../../services/displayUtils';
import {
  chart_color_blue_500,
  global_FontSize_sm,
  global_spacer_md,
  global_spacer_sm,
  global_spacer_xs
} from '@patternfly/react-tokens';
import countersService from '../../services/countersService';

const CounterTableDisplay = (props: {
  setCountersCount: (number) => void;
  isVisible: boolean;
}) => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [filteredCounters, setFilteredCounters] = useState<Counter[]>([]);

  const [countersPagination, setCountersPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);

  const columns = [
    { title: 'Name' },
    {
      title: 'Type'
    },
    {
      title: 'Value'
    },
    {
      title: 'Initial value'
    },
    {
      title: 'Storage'
    }
  ];

  useEffect(() => {
    countersService.getCounters().then(counters => {
      setCounters(counters);
      setFilteredCounters(counters);
      props.setCountersCount(counters.length);
      const initSlice =
        (countersPagination.page - 1) * countersPagination.perPage;
      updateRows(
        counters.slice(initSlice, initSlice + countersPagination.perPage)
      );
    });
  }, []);

  const onSetPage = (_event, pageNumber) => {
    setCountersPagination({
      page: pageNumber,
      perPage: countersPagination.perPage
    });
    const initSlice = (pageNumber - 1) * countersPagination.perPage;
    updateRows(
      filteredCounters.slice(initSlice, initSlice + countersPagination.perPage)
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setCountersPagination({
      page: countersPagination.page,
      perPage: perPage
    });
    const initSlice = (countersPagination.page - 1) * perPage;
    updateRows(filteredCounters.slice(initSlice, initSlice + perPage));
  };

  const counterType = (type: string) => {
    return (
      <Badge
        style={{
          backgroundColor: displayUtils.counterTypeColor(type),
          color: chart_color_blue_500.value,
          fontSize: global_FontSize_sm.value,
          fontWeight: 'lighter',
          marginRight: global_spacer_md.value,
          padding: global_spacer_xs.value,
          paddingRight: global_spacer_sm.value,
          paddingLeft: global_spacer_sm.value
        }}
      >
        {type}
      </Badge>
    );
  };

  const updateRows = (counters: Counter[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (counters.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      There are no counters
                    </Title>
                    <EmptyStateBody>
                      Create one using REST endpoint, HotRod or the CLI
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    } else {
      rows = counters.map(counter => {
        return {
          heightAuto: true,
          cells: [
            { title: counter.name },
            { title: counterType(counter.config.type) },
            { title: counter.value },
            { title: counter.config.initialValue },
            { title: counter.config.storage }
          ]
          //TODO {title: <CounterActionLinks name={counter.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  if (!props.isVisible) {
    return <span />;
  }

  return (
    <Stack>
      <StackItem>
        <Pagination
          itemCount={filteredCounters.length}
          perPage={countersPagination.perPage}
          page={countersPagination.page}
          onSetPage={onSetPage}
          widgetId="pagination-counters"
          onPerPageSelect={onPerPageSelect}
          isCompact
        />
        <Table
          aria-label="Counters"
          cells={columns}
          rows={rows}
          className={'counters-table'}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </StackItem>
    </Stack>
  );
};

export { CounterTableDisplay };
