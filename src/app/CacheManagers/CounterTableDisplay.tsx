import React, { useEffect, useState } from 'react';
import { cellWidth, Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Select,
  SelectOption,
  SelectVariant,
  SelectGroup,
  Pagination,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { SearchIcon } from '@patternfly/react-icons';
import { DeleteCounter } from '@app/Counters/DeleteCounter';
import { useFetchCounters } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { numberWithCommas } from '@utils/numberWithComma';
import { CounterType, CounterStorage } from '@services/infinispanRefData';

const CounterTableDisplay = (props: { setCountersCount: (number) => void; isVisible: boolean }) => {
  const { counters, loading, error, reload } = useFetchCounters();
  const [strongCounters, setStrongCounters] = useState<Counter[]>([]);
  const [weakCounters, setWeakCounters] = useState<Counter[]>([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({
    counterType: CounterType.STRONG_COUNTER,
    storageType: ''
  });
  const [filteredCounters, setFilteredCounters] = useState<Counter[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [counterToDelete, setCounterToDelete] = useState('');
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  useEffect(() => {
    loadCounters();
  }, [loading, counters, error]);

  const strongCountersActions = [
    {
      title: t('cache-managers.delete'),
      onClick: (event, rowId, rowData, extra) => setCounterToDelete(rowData.cells[0].title)
    }
  ];

  const weakCountersActions = [
    {
      title: t('cache-managers.delete'),
      onClick: (event, rowId, rowData, extra) => setCounterToDelete(rowData.cells[0].title)
    }
  ];

  const [countersPagination, setCountersPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);

  useEffect(() => {
    if (filteredCounters) {
      const initSlice = (countersPagination.page - 1) * countersPagination.perPage;
      updateRows(filteredCounters.slice(initSlice, initSlice + countersPagination.perPage));
    }
  }, [countersPagination, filteredCounters]);

  const columnNames = {
    name: t('cache-managers.counter-name'),
    currVal: t('cache-managers.current-value'),
    initVal: t('cache-managers.initial-value'),
    storage: t('cache-managers.storage'),
    config: t('cache-managers.counter-configuration')
  };

  const loadCounters = () => {
    if (counters) {
      const weakCounters = counters.filter((counter) => counter.config.type == t('cache-managers.weak'));
      const strongCounters = counters.filter((counter) => counter.config.type == t('cache-managers.strong'));

      setWeakCounters(weakCounters);
      setStrongCounters(strongCounters);

      let currentCounters;
      if (selectedFilter.counterType == CounterType.STRONG_COUNTER) {
        currentCounters = strongCounters;
      } else {
        currentCounters = weakCounters;
      }

      setFilteredCounters(currentCounters);
      props.setCountersCount(counters.length);
    }
  };

  const onSetPage = (_event, pageNumber) => {
    setCountersPagination({
      ...countersPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setCountersPagination({
      page: 1,
      perPage: perPage
    });
  };

  const displayConfig = (config: CounterConfig) => {
    if (config.upperBound) {
      return (
        <Grid>
          <GridItem>
            <TextContent>
              <Text component={TextVariants.small}>
                {t('cache-managers.lower-bound')} {numberWithCommas(config.lowerBound)}
              </Text>
            </TextContent>
          </GridItem>
          <GridItem>
            <TextContent>
              <Text component={TextVariants.small}>
                {t('cache-managers.upper-bound')} {numberWithCommas(config.upperBound)}
              </Text>
            </TextContent>
          </GridItem>
        </Grid>
      );
    }

    return (
      <TextContent>
        <Text component={TextVariants.small}>
          {t('cache-managers.concurrency-level')} {config.concurrencyLevel}
        </Text>
      </TextContent>
    );
  };

  const updateRows = (counters: Counter[]) => {
    let rows: Array<any> | React.SetStateAction<any>;

    if (counters.length == 0) {
      rows = (
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.small}>
            <EmptyStateIcon icon={SearchIcon} />
            <Title headingLevel="h2" size="lg">
              {t('cache-managers.no-counters-status')}
            </Title>
            <EmptyStateBody>{t('cache-managers.no-counters-body')}</EmptyStateBody>
          </EmptyState>
        </Bullseye>
      );
      setActions([]);
    } else {
      rows = counters;
      setActions(
        selectedFilter.counterType === CounterType.STRONG_COUNTER ? strongCountersActions : weakCountersActions
      );
    }
    setRows(rows);
  };

  if (!props.isVisible) {
    return <span />;
  }

  const onSelectFilter = (event, selection) => {
    let currentCounters;

    if (selection === CounterType.STRONG_COUNTER || selection === CounterType.WEAK_COUNTER) {
      setSelectedFilter({ ...selectedFilter, counterType: selection });
      selection === CounterType.STRONG_COUNTER ? (currentCounters = strongCounters) : (currentCounters = weakCounters);

      // Case when storage was already selected
      if (selectedFilter.storageType !== '')
        currentCounters = currentCounters.filter((counter) => counter.config.storage === selectedFilter.storageType);
    } else if (selection === CounterStorage.PERSISTENT || selection === CounterStorage.VOLATILE) {
      // Case when storage is un-selected
      if (selectedFilter.storageType === selection) {
        setSelectedFilter({ ...selectedFilter, storageType: '' });
        selectedFilter.counterType === CounterType.STRONG_COUNTER
          ? (currentCounters = strongCounters)
          : (currentCounters = weakCounters);
      } else {
        setSelectedFilter({ ...selectedFilter, storageType: selection });
        currentCounters = counters.filter(
          (counter) => counter.config.storage === selection && counter.config.type === selectedFilter.counterType
        );
      }
    }

    setFilteredCounters(currentCounters);
  };

  const countersFilter = () => {
    const menuItems = [
      <SelectGroup label="Counter Type" key="group1">
        <SelectOption key={0} value={CounterType.STRONG_COUNTER} />
        <SelectOption key={1} value={CounterType.WEAK_COUNTER} />
      </SelectGroup>,
      <SelectGroup label="Storage" key="group2">
        <SelectOption key={2} value={CounterStorage.PERSISTENT} />
        <SelectOption key={3} value={CounterStorage.VOLATILE} />
      </SelectGroup>
    ];

    return (
      <Select
        variant={SelectVariant.checkbox}
        onToggle={() => setIsOpenFilter(!isOpenFilter)}
        onSelect={onSelectFilter}
        selections={[selectedFilter.counterType, selectedFilter.storageType]}
        isOpen={isOpenFilter}
        placeholderText={
          selectedFilter.counterType === CounterType.STRONG_COUNTER ? 'Strong counters' : 'Weak counters'
        }
        aria-labelledby={'filter-counter-menu'}
        isGrouped
      >
        {menuItems}
      </Select>
    );
  };

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
      <TableComposable
        className={'strongCounters-table'}
        aria-label={t('cache-managers.counters-table-label')}
        variant={'compact'}
      >
        <Thead>
          <Tr>
            <Th colSpan={1}>{columnNames.name}</Th>
            <Th colSpan={1}>{columnNames.currVal}</Th>
            <Th colSpan={1}>{columnNames.initVal}</Th>
            <Th colSpan={1}>{columnNames.storage}</Th>
            <Th colSpan={2}>{columnNames.config}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(rows) ? (
            rows.map((row) => (
              <Tr key={row.name}>
                <Td dataLabel={columnNames.name}>{row.name}</Td>
                <Td dataLabel={columnNames.currVal}>{numberWithCommas(row.value)}</Td>
                <Td dataLabel={columnNames.initVal}>{numberWithCommas(row.config.initialValue)}</Td>
                <Td dataLabel={columnNames.storage}>{row.config.storage}</Td>
                <Td dataLabel={columnNames.config}>{displayConfig(row.config)}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={8} dataLabel={columnNames.name}>
                {rows}
              </Td>
            </Tr>
          )}
        </Tbody>
      </TableComposable>
      <DeleteCounter
        name={counterToDelete}
        isModalOpen={counterToDelete != ''}
        closeModal={() => {
          setCounterToDelete('');
          reload();
        }}
      />
    </React.Fragment>
  );
};

export { CounterTableDisplay };
