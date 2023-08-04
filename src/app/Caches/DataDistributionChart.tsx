import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  EmptyStateHeader,
  Level,
  LevelItem,
  Pagination,
  SearchInput,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Chart, ChartBar, ChartGroup, ChartVoronoiContainer, ChartThemeColor } from '@patternfly/react-charts';
import { SearchIcon } from '@patternfly/react-icons';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useDataDistribution } from '@app/services/dataDistributionHook';
import { DataDistributionStatsOption } from '@services/infinispanRefData';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { useCacheDetail } from '@app/services/cachesHook';
import { onSearch } from '@app/utils/searchFilter';

const DataDistributionChart = (props: { cacheName: string }) => {
  const { t } = useTranslation();
  const { cache } = useCacheDetail();
  const brandname = t('brandname.brandname');
  const MAX_NUMBER_FOR_CHART = 5;
  const [isOpenStatsOptions, setIsOpenStatsOptions] = useState<boolean>(false);
  const [statsOption, setStatsOption] = useState<string>(DataDistributionStatsOption.Entries);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    perPage: 5
  });
  const [tableRow, setTableRow] = useState<DataDistribution[]>();
  const { dataDistribution, loading, error } = useDataDistribution(props.cacheName);
  const [displayMemoryUsed, setDisplayMemoryUsed] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataDistribution[]>([]);

  useEffect(() => {
    if (dataDistribution) setFilteredData(dataDistribution);
  }, [dataDistribution, error, loading]);

  useEffect(() => {
    if (filteredData) {
      const initSlice = (tablePagination.page - 1) * tablePagination.perPage;
      const updateRows = filteredData.slice(initSlice, initSlice + tablePagination.perPage);
      updateRows.length > 0 ? setTableRow(updateRows) : setTableRow([]);
    }
  }, [tablePagination, filteredData]);

  useEffect(() => {
    if (dataDistribution) {
      setFilteredData(dataDistribution.filter((data) => onSearch(searchValue, data.node_name)));
      onSetPage(1);
    }
  }, [searchValue, dataDistribution]);

  useEffect(() => {
    // To display memory_used
    const loadMemory = JSON.parse(cache.configuration.config)[props.cacheName];
    const cacheMode = Object.keys(loadMemory)[0];
    loadMemory[cacheMode].memory && loadMemory[cacheMode].memory['max-size']
      ? setDisplayMemoryUsed(true)
      : setDisplayMemoryUsed(false);
  }, [cache, dataDistribution]);

  const onSelectStatsOptions = (event, selection, isPlaceholder) => {
    if (selection === DataDistributionStatsOption.Entries) setStatsOption(DataDistributionStatsOption.Entries);
    else if (selection === DataDistributionStatsOption.MemoryUsed)
      setStatsOption(DataDistributionStatsOption.MemoryUsed);
    setIsOpenStatsOptions(false);
  };

  const onPerPageSelect = (event, selection) => {
    setTablePagination({
      page: 1,
      perPage: selection
    });
  };

  const onSetPage = (selection) => {
    setTablePagination({
      ...tablePagination,
      page: selection
    });
  };

  const columnNames = {
    nodeName: t('caches.cache-metrics.data-distribution-node-name'),
    entries: t('caches.cache-metrics.data-distribution-option-entries'),
    memory_entries: t('caches.cache-metrics.data-distribution-option-memory-entries'),
    memory_used: t('caches.cache-metrics.data-distribution-option-memory-used')
  };

  const searchInput = (
    <SearchInput
      placeholder={t('caches.cache-metrics.data-distribution-search')}
      value={searchValue}
      onChange={(_event, val) => setSearchValue(val)}
      onClear={() => setSearchValue('')}
    />
  );

  const pagination = (
    <Pagination
      data-cy="paginationArea"
      itemCount={dataDistribution?.length}
      perPage={tablePagination.perPage}
      page={tablePagination.page}
      onSetPage={(event, selection) => onSetPage(selection)}
      widgetId="distribution-table-pagination"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const distributionTable = (
    <React.Fragment>
      <Toolbar id="distribution-table-toolbar">
        <ToolbarContent>
          <ToolbarItem variant="search-filter">{searchInput}</ToolbarItem>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label={t('caches.cache-metrics.data-distribution-table')} variant={TableVariant.compact} borders>
        <Thead>
          <Tr>
            <Th>{columnNames.nodeName}</Th>
            <Th>{columnNames.entries}</Th>
            <Th>{columnNames.memory_entries}</Th>
            <Th>{columnNames.memory_used}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredData.length == 0 ? (
            <Tr>
              <Td colSpan={6}>
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.sm}>
                    <EmptyStateHeader
                      titleText={<>{t('caches.cache-metrics.data-distribution-no-filtered')}</>}
                      icon={<EmptyStateIcon icon={SearchIcon} />}
                      headingLevel="h2"
                    />
                    <EmptyStateBody>{t('caches.cache-metrics.data-distribution-no-filtered-body')}</EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              </Td>
            </Tr>
          ) : (
            tableRow?.map((row) => (
              <Tr key={row.node_name}>
                <Td dataLabel={columnNames.nodeName}>{row.node_name}</Td>
                <Td dataLabel={columnNames.entries}>{row.total_entries}</Td>
                <Td dataLabel={columnNames.memory_entries}>{row.memory_entries}</Td>
                <Td dataLabel={columnNames.memory_used}>{row.memory_used}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </React.Fragment>
  );

  // Find max domain for chart
  let maxDomain = 1;
  if (dataDistribution) {
    if (statsOption === DataDistributionStatsOption.Entries) {
      const totalEntriesMaxDomain = Math.max(...dataDistribution.map((entry) => entry.total_entries), 1);
      const memoryEntriesMaxDomain = Math.max(...dataDistribution.map((entry) => entry.memory_entries), 1);
      maxDomain = Math.max(totalEntriesMaxDomain, memoryEntriesMaxDomain);
    } else if (statsOption === DataDistributionStatsOption.MemoryUsed) {
      maxDomain = Math.max(...dataDistribution.map((entry) => entry.memory_used), 1);
    }
  }

  const dataTotalEntries = dataDistribution?.map((item, index) => {
    return {
      name: 'N ' + index + ': ' + item.node_name,
      y: item.total_entries > 0 ? item.total_entries : 0,
      x: 'N ' + index + ':' + item.node_name
    };
  });

  const dataMemoryEntries = dataDistribution?.map((item, index) => {
    return {
      name: 'N ' + index + ': ' + item.node_name,
      y: item.memory_entries > 0 ? item.memory_entries : 0,
      x: 'N ' + index + ':' + item.node_name
    };
  });

  const dataMemoryUsed = dataDistribution?.map((item, index) => {
    return {
      name: 'N ' + index + ': ' + item.node_name,
      y: item.memory_used > 0 ? item.memory_used : 0,
      x: 'N ' + index + ':' + item.node_name
    };
  });

  const distributionChart = (
    <div style={{ height: '470px', width: '100%', maxWidth: '700px', margin: 'auto' }}>
      <Chart
        ariaDesc={t('caches.cache-metrics.data-distribution')}
        ariaTitle={t('caches.cache-metrics.data-distribution')}
        containerComponent={
          <ChartVoronoiContainer
            data-cy="data-distribution-chart"
            labels={({ datum }) =>
              datum.y !== 0
                ? `${datum.y}`
                : statsOption !== DataDistributionStatsOption.MemoryUsed
                ? `${t('caches.cache-metrics.data-distribution-no-entry')}`
                : `${t('caches.cache-metrics.data-distribution-no-memory')}`
            }
            constrainToVisibleArea
          />
        }
        domain={{ y: [0, maxDomain] }}
        domainPadding={{ x: [30, 25] }}
        legendData={
          statsOption === DataDistributionStatsOption.MemoryUsed
            ? [
                {
                  name: t('caches.cache-metrics.data-distribution-option-memory-used')
                }
              ]
            : [
                {
                  name: t('caches.cache-metrics.data-distribution-option-entries')
                },
                {
                  name: t('caches.cache-metrics.data-distribution-option-memory-entries')
                }
              ]
        }
        legendOrientation="horizontal"
        legendPosition="bottom-left"
        height={350}
        padding={{
          bottom: 10,
          left: 200, // Adjusted to accommodate y axis label
          right: 50, // Adjusted to accommodate legend
          top: 0
        }}
        width={700}
        themeColor={
          statsOption === DataDistributionStatsOption.MemoryUsed ? ChartThemeColor.cyan : ChartThemeColor.blue
        }
      >
        {statsOption === DataDistributionStatsOption.MemoryUsed ? (
          <ChartGroup offset={11} horizontal>
            <ChartBar data={dataMemoryUsed} />
          </ChartGroup>
        ) : (
          <ChartGroup offset={11} horizontal>
            <ChartBar data={dataTotalEntries} />
            <ChartBar data={dataMemoryEntries} />
          </ChartGroup>
        )}
      </Chart>
    </div>
  );

  const buildCardContent = () => {
    if (loading && !dataDistribution) {
      return <Spinner size={'lg'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    return dataDistribution && dataDistribution.length <= MAX_NUMBER_FOR_CHART ? distributionChart : distributionTable;
  };

  const buildStatsOption = () => {
    return (
      <LevelItem>
        <Select
          variant={SelectVariant.single}
          aria-label="storage-select"
          onToggle={() => setIsOpenStatsOptions(!isOpenStatsOptions)}
          onSelect={onSelectStatsOptions}
          selections={statsOption}
          isOpen={isOpenStatsOptions}
          aria-labelledby="toggle-id-storage"
          toggleId="storageSelector"
          width={'100%'}
          position="right"
        >
          <SelectOption key={0} value={DataDistributionStatsOption.Entries} />
          <SelectOption hidden={!displayMemoryUsed} key={1} value={DataDistributionStatsOption.MemoryUsed} />
        </Select>
      </LevelItem>
    );
  };

  return (
    <Card>
      <CardTitle>
        <Level id={'data-node-stats'}>
          <LevelItem>
            <PopoverHelp
              name="data-node-stats"
              label={t('caches.cache-metrics.data-distribution-title')}
              content={t('caches.cache-metrics.data-distribution-tooltip')}
              text={t('caches.cache-metrics.data-distribution-title')}
            />
          </LevelItem>
          {dataDistribution &&
            dataDistribution.length <= MAX_NUMBER_FOR_CHART &&
            displayMemoryUsed &&
            buildStatsOption()}
        </Level>
      </CardTitle>
      <CardBody>{buildCardContent()}</CardBody>
    </Card>
  );
};

export { DataDistributionChart };
