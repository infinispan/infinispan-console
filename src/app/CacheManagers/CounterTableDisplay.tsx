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
  ToolbarItemVariant,
  ToolbarGroup
} from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { DeleteCounter } from '@app/Counters/DeleteCounter';
import { useFetchCounters } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { numberWithCommas } from '@utils/numberWithComma';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { CounterType, CounterStorage } from '@services/infinispanRefData';

const CounterTableDisplay = (props: { setCountersCount: (number) => void; isVisible: boolean }) => {
  const { counters, loading, error, reload } = useFetchCounters();
  const [strongCounters, setStrongCounters] = useState<Counter[]>([]);
  const [weakCounters, setWeakCounters] = useState<Counter[]>([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    counterType: '',
    storageType: ''
  });
  const [filteredCounters, setFilteredCounters] = useState<Counter[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [counterToDelete, setCounterToDelete] = useState('');
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

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

  const columnNames = {
    name: t('cache-managers.counters.counter-name'),
    currVal: t('cache-managers.counters.current-value'),
    initVal: t('cache-managers.counters.initial-value'),
    storage: t('cache-managers.counters.storage'),
    config: t('cache-managers.counters.counter-configuration')
  };

  useEffect(() => {
    if (counters) {
      const weakCounters = counters.filter((counter) => counter.config.type === CounterType.WEAK_COUNTER);
      const strongCounters = counters.filter((counter) => counter.config.type === CounterType.STRONG_COUNTER);

      setWeakCounters(weakCounters);
      setStrongCounters(strongCounters);
      setFilteredCounters(counters);
      props.setCountersCount(counters.length);
    }
  }, [loading, counters, error]);

  useEffect(() => {
    if (filteredCounters) {
      const initSlice = (countersPagination.page - 1) * countersPagination.perPage;
      updateRows(filteredCounters.slice(initSlice, initSlice + countersPagination.perPage));
    }
  }, [countersPagination, filteredCounters]);

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

  const updateRows = (counters: Counter[]) => {
    let rows: Array<any> | React.SetStateAction<any>;

    if (counters.length == 0) {
      rows = [];
      setActions([]);
    } else {
      rows = counters;
      setActions(
        selectedFilters.counterType === CounterType.STRONG_COUNTER ? strongCountersActions : weakCountersActions
      );
    }
    setRows(rows);
  };

  const onSelectFilter = (event, selection) => {
    let currentCounters;

    if (selection === CounterType.STRONG_COUNTER || selection === CounterType.WEAK_COUNTER) {
      if (selectedFilters.counterType == selection) {
        setSelectedFilters({ ...selectedFilters, counterType: '' });
        selectedFilters.storageType == ''
          ? (currentCounters = counters)
          : (currentCounters = counters.filter(
              (counter) => counter.config.storage == selectedFilters.storageType.toUpperCase()
            ));
      } else {
        setSelectedFilters({ ...selectedFilters, counterType: selection });
        selectedFilters.storageType === ''
          ? selection === CounterType.STRONG_COUNTER
            ? (currentCounters = strongCounters)
            : (currentCounters = weakCounters)
          : selection === CounterType.STRONG_COUNTER
          ? (currentCounters = strongCounters.filter(
              (counter) => counter.config.storage == selectedFilters.storageType.toUpperCase()
            ))
          : (currentCounters = weakCounters.filter(
              (counter) => counter.config.storage == selectedFilters.storageType.toUpperCase()
            ));
      }
    }

    if (selection === CounterStorage.VOLATILE || selection === CounterStorage.PERSISTENT) {
      if (selectedFilters.storageType == selection) {
        setSelectedFilters({ ...selectedFilters, storageType: '' });
        selectedFilters.counterType == ''
          ? (currentCounters = counters)
          : (currentCounters = counters.filter((counter) => counter.config.type == selectedFilters.counterType));
      } else {
        setSelectedFilters({ ...selectedFilters, storageType: selection });
        selectedFilters.counterType === ''
          ? selection === CounterStorage.VOLATILE
            ? (currentCounters = counters.filter(
                (counter) => counter.config.storage == CounterStorage.VOLATILE.toUpperCase()
              ))
            : (currentCounters = counters.filter(
                (counter) => counter.config.storage == CounterStorage.PERSISTENT.toUpperCase()
              ))
          : selectedFilters.counterType === CounterType.STRONG_COUNTER
          ? (currentCounters = strongCounters.filter((counter) => counter.config.storage == selection.toUpperCase()))
          : (currentCounters = weakCounters.filter((counter) => counter.config.storage == selection.toUpperCase()));
      }
    }

    setFilteredCounters(currentCounters);
  };

  const countersFilter = () => {
    const menuItems = [
      <SelectGroup label={t('cache-managers.counters.counter-type')} key="group1">
        <SelectOption key={0} value={CounterType.STRONG_COUNTER} />
        <SelectOption key={1} value={CounterType.WEAK_COUNTER} />
      </SelectGroup>,
      <SelectGroup label={t('cache-managers.counters.storage')} key="group2">
        <SelectOption key={2} value={CounterStorage.PERSISTENT} />
        <SelectOption key={3} value={CounterStorage.VOLATILE} />
      </SelectGroup>
    ];

    return (
      <ToolbarGroup variant="filter-group">
        <ToolbarItem style={{ width: 250 }} data-cy="counterFilterSelect">
          <Select
            variant={SelectVariant.checkbox}
            aria-label={t('cache-managers.cache-filter-label')}
            onToggle={() => setIsOpenFilter(!isOpenFilter)}
            onSelect={onSelectFilter}
            selections={[selectedFilters.counterType, selectedFilters.storageType]}
            isOpen={isOpenFilter}
            toggleIcon={<FilterIcon />}
            maxHeight={200}
            placeholderText={t('cache-managers.cache-filter-label')}
            isGrouped={true}
            data-cy="counterFilterSelectExpanded"
            isCheckboxSelectionBadgeHidden={true}
          >
            {menuItems}
          </Select>
        </ToolbarItem>
      </ToolbarGroup>
    );
  };

  const displayConfig = (config: CounterConfig) => {
    if (config.upperBound) {
      return (
        <Grid>
          <GridItem>
            <TextContent>
              <Text component={TextVariants.small}>
                {t('cache-managers.counters.lower-bound')} {numberWithCommas(config.lowerBound)}
              </Text>
            </TextContent>
          </GridItem>
          <GridItem>
            <TextContent>
              <Text component={TextVariants.small}>
                {t('cache-managers.counters.upper-bound')} {numberWithCommas(config.upperBound)}
              </Text>
            </TextContent>
          </GridItem>
        </Grid>
      );
    }

    return (
      <TextContent>
        <Text component={TextVariants.small}>
          {t('cache-managers.counters.concurrency-level')} {config.concurrencyLevel}
        </Text>
      </TextContent>
    );
  };

  if (!props.isVisible) {
    return <span />;
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
      <TableComposable
        className={'strongCounters-table'}
        aria-label={t('cache-managers.counters.counters-table-label')}
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
          {counters.length == 0 || filteredCounters.length == 0 ? (
            <Tr>
              <Td colSpan={6}>
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      {t('cache-managers.counters.no-counters-status')}
                    </Title>
                    <EmptyStateBody>
                      {counters.length == 0
                        ? t('cache-managers.counters.no-counters-body')
                        : t('cache-managers.counters.no-filtered-counter-body')}
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              </Td>
            </Tr>
          ) : (
            rows.map((row) => (
              <Tr key={row.name}>
                <Td dataLabel={columnNames.name}>{row.name}</Td>
                <Td dataLabel={columnNames.currVal}>{numberWithCommas(row.value)}</Td>
                <Td dataLabel={columnNames.initVal}>{numberWithCommas(row.config.initialValue)}</Td>
                <Td dataLabel={columnNames.storage}>{row.config.storage}</Td>
                <Td dataLabel={columnNames.config}>{displayConfig(row.config)}</Td>
              </Tr>
            ))
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
