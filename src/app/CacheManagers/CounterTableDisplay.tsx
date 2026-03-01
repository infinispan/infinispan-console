import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Grid,
  GridItem,
  Label,
  Pagination,
  SearchInput,
  SelectOptionProps,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DeleteCounter } from '@app/Counters/DeleteCounter';
import { useFetchCounters } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { numberWithCommas } from '@utils/numberWithComma';
import { DatabaseIcon, SearchIcon } from '@patternfly/react-icons';
import { CounterStorage, CounterType } from '@services/infinispanRefData';
import { AddDeltaCounter } from '@app/Counters/AddDeltaCounter';
import { ResetCounter } from '@app/Counters/ResetCounter';
import { CreateCounter } from '@app/Counters/CreateCounter';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { SetCounter } from '@app/Counters/SetCounter';
import { onSearch } from '@app/utils/searchFilter';
import { t_global_spacer_sm, t_global_spacer_xl } from '@patternfly/react-tokens';
import { SelectSingle } from '@app/Common/SelectSingle';
import { selectOptionProps } from '@utils/selectOptionPropsCreator';
import { useLocalStorage } from '@app/utils/localStorage';

const CounterTableDisplay = (props: { setCountersCount: (number) => void; isVisible: boolean }) => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { counters, loading, error, reload } = useFetchCounters();
  const [filteredCounters, setFilteredCounters] = useState<Counter[]>([]);

  const [selectedCounterType, setSelectedCounterType] = useState('');
  const [selectedCounterStorage, setSelectedCounterStorage] = useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const [counterToDelete, setCounterToDelete] = useState('');
  const [counterToEdit, setCounterToEdit] = useState<Counter | undefined>();
  const [counterToAddDelta, setCounterToAddDelta] = useState('');
  const [counterToSet, setCounterToSet] = useState('');

  const [deltaValue, setDeltaValue] = useState<number>(0);
  const [counterSetValue, setCounterSetValue] = useState<number>(0);
  const [counterToReset, setCounterToReset] = useState('');
  const [isCreateCounter, setIsCreateCounter] = useState(false);
  const [isDeltaValid, setIsDeltaValid] = useState(true);
  const [isNewCounterValueValid, setIsNewCounterValueValid] = useState(true);

  const [countersPagination, setCountersPagination] = useLocalStorage('counters-table', {
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<Counter[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (counters) {
      setFilteredCounters(counters);
      props.setCountersCount(counters.length);
    }
  }, [loading, counters, error]);

  useEffect(() => {
    if (filteredCounters) {
      const initSlice = (countersPagination.page - 1) * countersPagination.perPage;
      const updateRows = filteredCounters.slice(initSlice, initSlice + countersPagination.perPage);
      setRows(updateRows);
    }
  }, [countersPagination, filteredCounters]);

  useEffect(() => {
    setFilteredCounters(counters.filter((counter) => onSearch(searchValue, counter.name)).filter(onFilter));
  }, [searchValue, selectedCounterType, selectedCounterStorage]);

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

  const columnNames = {
    name: t('cache-managers.counters.counter-name'),
    currVal: t('cache-managers.counters.current-value'),
    initVal: t('cache-managers.counters.initial-value'),
    storage: t('cache-managers.counters.storage'),
    config: t('cache-managers.counters.counter-configuration')
  };

  const strongCountersActions = (row): IAction[] => [
    {
      'aria-label': 'setCounterAction',
      title: t('cache-managers.counters.set-action'),
      onClick: () => {
        setCounterToSet(row.name);
        setCounterToEdit(row);
      }
    },
    {
      'aria-label': 'addDeltaAction',
      title: t('cache-managers.counters.add-delta-action'),
      onClick: () => {
        setCounterToAddDelta(row.name);
        setCounterToEdit(row);
      }
    },
    {
      'aria-label': 'resetCounter',
      title: t('cache-managers.counters.reset-action'),
      onClick: () => {
        setCounterToReset(row.name);
        setCounterToEdit(row);
      }
    },
    {
      'aria-label': 'deleteCounter',
      title: t('cache-managers.counters.delete-action'),
      onClick: () => {
        setCounterToDelete(row.name);
      }
    }
  ];

  const weakCountersActions = (row): IAction[] => [
    {
      'aria-label': 'deleteCounter',
      title: t('cache-managers.counters.delete-action'),
      onClick: () => {
        setCounterToDelete(row.name);
      }
    }
  ];

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

  const onClearAllFilters = () => {
    setSearchValue('');
    setSelectedCounterStorage('');
    setSelectedCounterType('');
  };

  const onFilter = (counter: Counter) => {
    const matchesTypeValue = selectedCounterType.includes(counter.config.type);
    const matchesStorageValue = selectedCounterStorage.toUpperCase().includes(counter.config.storage);

    return (
      (selectedCounterType.length === 0 || matchesTypeValue) &&
      (selectedCounterStorage.length === 0 || matchesStorageValue)
    );
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (isFilterOpen && !menuRef.current?.contains(event.target as Node)) {
      setIsFilterOpen(false);
    }
  };

  const handleKeys = (event: KeyboardEvent) => {
    if (isFilterOpen && menuRef.current?.contains(event.target as Node)) {
      if (event.key === 'Escape' || event.key === 'Tab') {
        setIsFilterOpen(!isFilterOpen);
        toggleRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isFilterOpen, menuRef]);

  const createCounterButtonHelper = () => {
    return (
      <Button
        variant={ButtonVariant.primary}
        aria-label="create-counter-button-helper"
        data-cy="createCounterButton"
        onClick={() => setIsCreateCounter(true)}
      >
        {t('cache-managers.counters.modal-create-title')}
      </Button>
    );
  };

  const buildSeparator = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser) || filteredCounters.length !== 0) {
      return;
    }
    return (
      <ToolbarItem
        variant={ToolbarItemVariant.separator}
        style={{ marginInline: t_global_spacer_sm.value }}
      ></ToolbarItem>
    );
  };

  const buildCreateCounterButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return;
    }
    return <ToolbarItem>{createCounterButtonHelper()}</ToolbarItem>;
  };

  const searchInput = (
    <SearchInput
      data-cy={'counter-search'}
      placeholder={t('cache-managers.counters.search')}
      value={searchValue}
      onChange={(_event, val) => setSearchValue(val)}
      onClear={() => setSearchValue('')}
    />
  );

  const pagination = (dropDirection) => {
    return (
      <Pagination
        itemCount={filteredCounters.length}
        perPage={countersPagination.perPage}
        page={countersPagination.page}
        onSetPage={onSetPage}
        widgetId="pagination-counters"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  const toolbar = (
    <Toolbar
      id="counters-table-toolbar"
      clearAllFilters={() => {
        setSelectedCounterType('');
        setSelectedCounterStorage('');
      }}
    >
      <ToolbarContent>
        <ToolbarItem>
          <SelectSingle
            id={'counterTypeFilter'}
            placeholder={t('cache-managers.counters.counter-type')}
            options={[
              {
                id: 'counterTypeFilterClear',
                value: 'clear',
                children: t('cache-managers.counters.counter-type')
              } as SelectOptionProps
            ].concat(selectOptionProps(CounterType))}
            selected={selectedCounterType}
            onSelect={(value) => (value == 'clear' ? setSelectedCounterType('') : setSelectedCounterType(value))}
          />
        </ToolbarItem>
        <ToolbarItem>
          <SelectSingle
            id={'counterStorageFilter'}
            placeholder={t('cache-managers.counters.storage')}
            options={[
              {
                id: 'counterStorageFilterClear',
                value: 'clear',
                children: t('cache-managers.counters.storage')
              } as SelectOptionProps
            ].concat(selectOptionProps(CounterStorage))}
            selected={selectedCounterStorage}
            onSelect={(value) => (value == 'clear' ? setSelectedCounterStorage('') : setSelectedCounterStorage(value))}
          />
        </ToolbarItem>
        <ToolbarItem>{searchInput}</ToolbarItem>
        {buildSeparator()}
        {buildCreateCounterButton()}
        {filteredCounters.length !== 0 && (
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination('down')}</ToolbarItem>
        )}
      </ToolbarContent>
    </Toolbar>
  );

  const emptyPage = (
    <EmptyState
      variant={EmptyStateVariant.lg}
      titleText={t('cache-managers.counters.no-counters-status')}
      icon={DatabaseIcon}
      headingLevel="h4"
    >
      <EmptyStateBody>{t('cache-managers.counters.no-counters-body')}</EmptyStateBody>
      <EmptyStateFooter>{createCounterButtonHelper()}</EmptyStateFooter>
    </EmptyState>
  );

  const displayConfig = (config: CounterConfig) => {
    if (config.type === CounterType.STRONG_COUNTER) {
      return (
        <Grid>
          <GridItem>
            <Content component={ContentVariants.small}>
              {t('cache-managers.counters.lower-bound')} {numberWithCommas(config.lowerBound)}
            </Content>
          </GridItem>
          <GridItem>
            <Content component={ContentVariants.small}>
              {t('cache-managers.counters.upper-bound')} {numberWithCommas(config.upperBound)}
            </Content>
          </GridItem>
        </Grid>
      );
    } else if (config.type === CounterType.WEAK_COUNTER) {
      return (
        <Content component={ContentVariants.small}>
          {t('cache-managers.counters.concurrency-level')} {config.concurrencyLevel}
        </Content>
      );
    }
    return '';
  };

  const displayStorage = (storage) => {
    const labelColor = storage === CounterStorage.PERSISTENT.toUpperCase() ? 'purple' : 'blue';
    const storageValue =
      storage === CounterStorage.PERSISTENT.toUpperCase() ? CounterStorage.PERSISTENT : CounterStorage.VOLATILE;
    return (
      <Label color={labelColor} data-cy={'storage-' + storage}>
        {storageValue}
      </Label>
    );
  };

  if (!props.isVisible) {
    return <span />;
  }

  let page = emptyPage;
  if (counters.length > 0) {
    page = (
      <>
        {toolbar}
        <Table className={'counters-table'} aria-label={'counters-table-label'} variant={'compact'}>
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
            {filteredCounters.length == 0 ? (
              <Tr>
                <Td colSpan={6}>
                  <Bullseye>
                    <EmptyState variant={EmptyStateVariant.sm} icon={SearchIcon}>
                      <Title headingLevel="h2" size="lg">
                        {t('cache-managers.counters.no-filtered-counter')}
                      </Title>
                      <EmptyStateBody>{t('cache-managers.counters.no-filtered-counter-body')}</EmptyStateBody>
                    </EmptyState>
                  </Bullseye>
                </Td>
              </Tr>
            ) : (
              rows.map((row) => {
                let rowActions: IAction[];
                if (row.config.type === CounterType.STRONG_COUNTER) {
                  rowActions = strongCountersActions(row);
                } else {
                  rowActions = weakCountersActions(row);
                }
                return (
                  <Tr key={row.name}>
                    <Td dataLabel={columnNames.name}>{row.name}</Td>
                    <Td dataLabel={columnNames.currVal}>{numberWithCommas(row.value)}</Td>
                    <Td dataLabel={columnNames.initVal}>{numberWithCommas(row.config.initialValue)}</Td>
                    <Td dataLabel={columnNames.storage}>{displayStorage(row.config.storage)}</Td>
                    <Td dataLabel={columnNames.config}>{displayConfig(row.config)}</Td>
                    <Td isActionCell data-cy={'actions-' + row.name}>
                      <ActionsColumn items={rowActions} />
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
        {filteredCounters.length !== 0 && (
          <Toolbar id="bottom-pagination-counter">
            <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination('up')}</ToolbarItem>
          </Toolbar>
        )}
      </>
    );
  }

  return (
    <React.Fragment>
      {page}
      <DeleteCounter
        name={counterToDelete}
        isModalOpen={counterToDelete != ''}
        submitModal={() => {
          setCounterToDelete('');
          onClearAllFilters();
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
          onClearAllFilters();
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
          onClearAllFilters();
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
          onClearAllFilters();
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
