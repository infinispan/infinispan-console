import React, { useEffect, useState } from 'react';
import {
  Button,
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
import { TableComposable, Thead, Tr, Th, Tbody, Td, IAction, ActionsColumn } from '@patternfly/react-table';
import { DeleteCounter } from '@app/Counters/DeleteCounter';
import { useFetchCounters } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { numberWithCommas } from '@utils/numberWithComma';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { CounterType, CounterStorage } from '@services/infinispanRefData';
import { AddDeltaCounter } from '@app/Counters/AddDeltaCounter';
import { ResetCounter } from '@app/Counters/ResetCounter';
import { CreateCounter } from '@app/Counters/CreateCounter';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { SetCounter } from '@app/Counters/SetCounter';

const CounterTableDisplay = (props: { setCountersCount: (number) => void; isVisible: boolean }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { counters, loading, error, reload } = useFetchCounters();
  const [strongCounters, setStrongCounters] = useState<Counter[]>([]);
  const [weakCounters, setWeakCounters] = useState<Counter[]>([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    counterType: '',
    storageType: ''
  });
  const [filteredCounters, setFilteredCounters] = useState<Counter[]>([]);
  const [counterToDelete, setCounterToDelete] = useState('');
  const [counterToEdit, setCounterToEdit] = useState();
  const [counterToAddDelta, setCounterToAddDelta] = useState('');
  const [counterToSet, setCounterToSet] = useState('');

  const [deltaValue, setDeltaValue] = useState<number>(0);
  const [counterSetValue, setCounterSetValue] = useState<number>(0);
  const [counterToReset, setCounterToReset] = useState('');
  const [isCreateCounter, setIsCreateCounter] = useState(false);
  const [isDeltaValid, setIsDeltaValid] = useState(true);
  const [isNewCounterValueValid, setIsNewCounterValueValid] = useState(true);
  const { connectedUser } = useConnectedUser();

  const strongCountersActions = (row): IAction[] => [
    {
      'data-cy': 'setCounterAction',
      title: t('cache-managers.counters.set-action'),
      onClick: () => {
        setCounterToSet(row.name);
        setCounterToEdit(row);
      }
    },
    {
      'data-cy': 'addDeltaAction',
      title: t('cache-managers.counters.add-delta-action'),
      onClick: () => {
        setCounterToAddDelta(row.name);
        setCounterToEdit(row);
      }
    },
    {
      'data-cy': 'resetCounter',
      title: t('cache-managers.counters.reset-action'),
      onClick: () => {
        setCounterToReset(row.name);
        setCounterToEdit(row);
      }
    },
    {
      'data-cy': 'deleteCounter',
      title: t('cache-managers.counters.delete-action'),
      onClick: () => {
        setCounterToDelete(row.name);
      }
    }
  ];

  const weakCountersActions = (row): IAction[] => [
    {
      'data-cy': 'deleteCounter',
      title: t('cache-managers.counters.delete-action'),
      onClick: () => {
        setCounterToDelete(row.name);
      }
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
      const updateRows = filteredCounters.slice(initSlice, initSlice + countersPagination.perPage);
      updateRows.length > 0 ? setRows(updateRows) : setRows([]);
    }
  }, [countersPagination, filteredCounters]);

  useEffect(() => {
    const validateDeltaValue = (value, counter): boolean => {
      const newCurrentValue: number = parseInt(counter?.value) + parseInt(value);
      if (newCurrentValue < counter?.config?.lowerBound || newCurrentValue > counter?.config?.upperBound) return false;
      return true;
    };
    setIsDeltaValid(validateDeltaValue(deltaValue, counterToEdit));
  }, [deltaValue]);

  useEffect(() => {
    const validateNewCounterValue = (value, counter): boolean => {
      if (value < parseInt(counter?.config?.lowerBound) || value > parseInt(counter?.config?.upperBound)) {
        return false;
      }
      return true;
    };
    setIsNewCounterValueValid(validateNewCounterValue(counterSetValue, counterToEdit));
  }, [counterSetValue]);

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
        <SelectOption data-cy="strongCounter" key={0} value={CounterType.STRONG_COUNTER} />
        <SelectOption data-cy="weakCounter" key={1} value={CounterType.WEAK_COUNTER} />
      </SelectGroup>,
      <SelectGroup label={t('cache-managers.counters.storage')} key="group2">
        <SelectOption data-cy="persistentCounter" key={2} value={CounterStorage.PERSISTENT} />
        <SelectOption data-cy="volatileCounter" key={3} value={CounterStorage.VOLATILE} />
      </SelectGroup>
    ];

    return (
      <ToolbarGroup variant="filter-group">
        <ToolbarItem style={{ width: 250 }}>
          <Select
            variant={SelectVariant.checkbox}
            aria-label={t('cache-managers.cache-filter-label')}
            onToggle={() => setIsOpenFilter(!isOpenFilter)}
            onSelect={onSelectFilter}
            selections={[selectedFilters.counterType, selectedFilters.storageType]}
            isOpen={isOpenFilter}
            toggleIcon={<FilterIcon />}
            toggleId="counterFilterSelect"
            maxHeight={200}
            placeholderText={t('cache-managers.cache-filter-label')}
            isGrouped={true}
            isCheckboxSelectionBadgeHidden={true}
          >
            {menuItems}
          </Select>
        </ToolbarItem>
      </ToolbarGroup>
    );
  };

  const displayConfig = (config: CounterConfig) => {
    if (config.type === CounterType.STRONG_COUNTER) {
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
    } else if (config.type === CounterType.WEAK_COUNTER) {
      return (
        <TextContent>
          <Text component={TextVariants.small}>
            {t('cache-managers.counters.concurrency-level')} {config.concurrencyLevel}
          </Text>
        </TextContent>
      );
    }
  };

  const buildCreateCounterButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return <ToolbarItem />;
    }
    return (
      <React.Fragment>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
        <ToolbarItem>
          <Button onClick={() => setIsCreateCounter(!isCreateCounter)} data-cy="createCounterButton">
            {t('cache-managers.counters.modal-create-title')}
          </Button>
        </ToolbarItem>
      </React.Fragment>
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
          {buildCreateCounterButton()}
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
        aria-label={'strong-counters-table-label'}
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
            rows.map((row) => {
              let rowActions: IAction[];
              row.config.type === CounterType.STRONG_COUNTER
                ? (rowActions = strongCountersActions(row))
                : (rowActions = weakCountersActions(row));

              return (
                <Tr key={row.name}>
                  <Td dataLabel={columnNames.name}>{row.name}</Td>
                  <Td dataLabel={columnNames.currVal}>{numberWithCommas(row.value)}</Td>
                  <Td dataLabel={columnNames.initVal}>{numberWithCommas(row.config.initialValue)}</Td>
                  <Td dataLabel={columnNames.storage}>{row.config.storage}</Td>
                  <Td dataLabel={columnNames.config}>{displayConfig(row.config)}</Td>
                  <Td isActionCell>
                    <ActionsColumn items={rowActions} />
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </TableComposable>
      <DeleteCounter
        name={counterToDelete}
        isModalOpen={counterToDelete != ''}
        submitModal={() => {
          setCounterToDelete('');
          setSelectedFilters({ counterType: '', storageType: '' });
          reload();
        }}
        closeModal={() => {
          setCounterToDelete('');
        }}
        isDisabled={!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)}
      />
      <AddDeltaCounter
        name={counterToAddDelta}
        deltaValue={deltaValue}
        setDeltaValue={setDeltaValue}
        isModalOpen={counterToAddDelta != ''}
        isDeltaValid={isDeltaValid}
        submitModal={() => {
          setCounterToAddDelta('');
          setDeltaValue(0);
          setSelectedFilters({ counterType: '', storageType: '' });
          reload();
        }}
        closeModal={() => {
          setCounterToAddDelta('');
          setDeltaValue(0);
        }}
      />
      <ResetCounter
        name={counterToReset}
        isModalOpen={counterToReset != ''}
        initialValue={counterToEdit?.config?.initialValue}
        submitModal={() => {
          setCounterToReset('');
          setSelectedFilters({ counterType: '', storageType: '' });
          reload();
        }}
        closeModal={() => {
          setCounterToReset('');
        }}
      />
      <CreateCounter
        isModalOpen={isCreateCounter}
        submitModal={() => {
          setIsCreateCounter(false);
          reload();
        }}
        closeModal={() => setIsCreateCounter(false)}
      />
      <SetCounter
        name={counterToSet}
        value={counterSetValue}
        setValue={setCounterSetValue}
        isValid={isNewCounterValueValid}
        submitModal={() => {
          setCounterToSet('');
          setCounterSetValue(0);
          setSelectedFilters({ counterType: '', storageType: '' });
          reload();
        }}
        isModalOpen={counterToSet != ''}
        closeModal={() => {
          setCounterToSet('');
          setCounterSetValue(0);
        }}
      />
    </React.Fragment>
  );
};

export { CounterTableDisplay };
