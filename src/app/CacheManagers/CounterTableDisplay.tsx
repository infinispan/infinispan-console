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
import { global_spacer_md } from '@patternfly/react-tokens';

const CounterTableDisplay: React.FunctionComponent<any> = (props: {
  counters: Counter[];
}) => {
  const [filteredCounters, setFilteredCounters] = useState<Counter[]>([
    ...props.counters
  ]);

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
    const initSlice =
      (countersPagination.page - 1) * countersPagination.perPage;
    updateRows(
      filteredCounters.slice(initSlice, initSlice + countersPagination.perPage)
    );
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
          marginRight: global_spacer_md.value
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
