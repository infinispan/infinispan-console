import React, {useEffect, useState} from 'react';
import {cellWidth, Table, TableBody, TableHeader, TableVariant} from '@patternfly/react-table';
import {
  Grid,
  GridItem,
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
  Pagination,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import {DeleteCounter} from "@app/Counters/DeleteCounter";
import {fetchCounters} from "@app/services/countersHook";
import {TableEmptyState} from "@app/Common/TableEmptyState";

const CounterTableDisplay = (props: {
  setCountersCount: (number) => void;
  isVisible: boolean;
}) => {
  const {counters, loading, error, reload} = fetchCounters();
  const STRONG_COUNTER = '0';
  const WEAK_COUNTER = '1';
  const [strongCounters, setStrongCounters] = useState<Counter[]>([]);
  const [weakCounters, setWeakCounters] = useState<Counter[]>([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedCounterType, setSelectedCounterType] = useState(STRONG_COUNTER);
  const [filteredCounters, setFilteredCounters] = useState<Counter[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [counterToDelete, setCounterToDelete] = useState('');

  useEffect(() => {
    loadCounters();
  }, [loading, counters, error, selectedCounterType]);

  const strongCountersActions = [
    {
      title: 'Delete',
      onClick: (event, rowId, rowData, extra) =>
        setCounterToDelete(rowData.cells[0].title)
    }
  ];

  const weakCountersActions = [
    {
      title: 'Delete',
      onClick: (event, rowId, rowData, extra) =>
        setCounterToDelete(rowData.cells[0].title)
    }
  ];

  const [countersPagination, setCountersPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);

  const columns = [
    {
      title: 'Name',
      transforms: [cellWidth(15)]
    },
    {
      title: 'Current value',
      transforms: [cellWidth(15)]
    },
    {
      title: 'Initial value',
      transforms: [cellWidth(15)]
    },
    {
      title: 'Storage'
    },
    {
      title: 'Configuration'
    }
  ];

  const loadCounters = () => {
      if(counters) {
        const weakCounters = counters.filter(counter => counter.config.type == 'Weak');
        const strongCounters = counters.filter(counter => counter.config.type == 'Strong');

        setWeakCounters(weakCounters)
        setStrongCounters(strongCounters);

        let currentCounters;
        if(selectedCounterType == STRONG_COUNTER) {
          currentCounters = strongCounters;
        } else {
          currentCounters = weakCounters;
        }

        setFilteredCounters(currentCounters);
        props.setCountersCount(counters.length);
        const initSlice =
          (countersPagination.page - 1) * countersPagination.perPage;
        updateRows(
          currentCounters.slice(initSlice, initSlice + countersPagination.perPage)
        );
      }
  }

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

  const displayConfig = (config: CounterConfig) => {
    if(config.upperBound) {
      return (
        <Grid>
          <GridItem>
            <TextContent>
              <Text component={TextVariants.small}>
                Lower bound: {displayUtils.formatNumber(config.lowerBound)}
              </Text>
            </TextContent>
          </GridItem>
          <GridItem>
            <TextContent>
              <Text component={TextVariants.small}>
                Upper bound: {displayUtils.formatNumber(config.upperBound)}
              </Text>
            </TextContent>
          </GridItem>
        </Grid>
      );
    }

    return (
      <TextContent>
        <Text component={TextVariants.small}>
          Concurrency level: {config.concurrencyLevel}
        </Text>
      </TextContent>
    );
  }

  const updateRows = (counters: Counter[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (counters.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 6 },
              title: (
                <TableEmptyState loading={loading} error={error} empty={'There are no counters'}/>
              )
            }
          ]
        }
      ];
      setActions([]);
    } else {
      rows = counters.map(counter => {
        return {
          heightAuto: true,
          cells: [
            { title: counter.name },
            { title: displayUtils.formatNumber(counter.value) },
            { title: displayUtils.formatNumber(counter.config.initialValue) },
            { title: counter.config.storage },
            { title: displayConfig(counter.config) }
          ]
        };

      });
      setActions(selectedCounterType === STRONG_COUNTER ? strongCountersActions : weakCountersActions);
    }
    setRows(rows);
  };

  if (!props.isVisible) {
    return <span />;
  }

  const onSelectCounterType = event => {
    const id = event.currentTarget.id;
    let switchCounters;
    if(id === STRONG_COUNTER) {
      switchCounters = strongCounters;
    } else {
      switchCounters = weakCounters;
    }

    setFilteredCounters(switchCounters);
    updateRows(switchCounters)
    setSelectedCounterType(id);
    setIsOpenFilter(false);
  };

  const countersFilter = () => {
    const menuItems = [
      <OptionsMenuItem onSelect={onSelectCounterType} isSelected={selectedCounterType === STRONG_COUNTER} id={STRONG_COUNTER} key="strong-counter">Strong counters</OptionsMenuItem>,
      <OptionsMenuItem onSelect={onSelectCounterType} isSelected={selectedCounterType === WEAK_COUNTER} id={WEAK_COUNTER} key="weak-counter">Weak counters</OptionsMenuItem>,
    ];
    const toggle = <OptionsMenuToggle onToggle={() => setIsOpenFilter(!isOpenFilter)} toggleTemplate={selectedCounterType === STRONG_COUNTER ? 'Strong counters' : 'Weak counters'} />

    return (
      <OptionsMenu
        id="filter-counter-menu"
        menuItems={menuItems}
        isOpen={isOpenFilter}
        toggle={toggle}/>
    );
  }

  return (
    <React.Fragment>
      <Toolbar id="counters-table-toolbar">
        <ToolbarContent>
          <ToolbarItem>{countersFilter()}</ToolbarItem>
          {/*<ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>*/}
          {/*<ToolbarItem><Button>{selectedCounterType === STRONG_COUNTER ? 'Create strong counter' : 'Create weak counter'}</Button></ToolbarItem>*/}
          <ToolbarItem variant={ToolbarItemVariant.pagination}>
            <Pagination
              itemCount={filteredCounters.length}
              perPage={countersPagination.perPage}
              page={countersPagination.page}
              onSetPage={onSetPage}
              widgetId="pagination-counters"
              onPerPageSelect={onPerPageSelect}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label="Counters"
        cells={columns}
        rows={rows}
        actions={actions}
        className={'strongCounters-table'}
        variant={TableVariant.compact}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <DeleteCounter name={counterToDelete} isModalOpen={counterToDelete != ''} closeModal={() => {
        setCounterToDelete('');
        reload();
      }}/>
    </React.Fragment>
  );
};

export { CounterTableDisplay };
