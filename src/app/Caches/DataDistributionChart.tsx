import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Level,
  LevelItem,
  Pagination,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Chart, ChartBar, ChartGroup, ChartVoronoiContainer } from '@patternfly/react-charts';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useDataDistribution } from '@app/services/dataDistributionHook';
import { DataDistributionStatsOption } from '@services/infinispanRefData';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { useCacheDetail } from '@app/services/cachesHook';

const DataDistributionChart = (props: { cacheName: string }) => {
  const { t } = useTranslation();
  const { cache } = useCacheDetail();
  const brandname = t('brandname.brandname');
  const MAX_NUMBER_FOR_CHART = 5;
  const [isOpenStatsOptions, setIsOpenStatsOptions] = useState<boolean>(false);
  const [statsOption, setStatsOption] = useState<string>(DataDistributionStatsOption.TotalEntries);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    perPage: 10
  });
  const [tableRow, setTableRow] = useState<DataDistribution[]>();

  const { dataDistribution, loading, error } = useDataDistribution(props.cacheName);

  const [displayMemoryUsed, setDisplayMemoryUsed] = useState<boolean>(false);

  useEffect(() => {
    cache.memory && cache.memory.max_size.length > 0
      ? setDisplayMemoryUsed(true)
      : setDisplayMemoryUsed(false);
  }, [cache, dataDistribution]);

  useEffect(() => {
    if (dataDistribution) {
      const initSlice = (tablePagination.page - 1) * tablePagination.perPage;
      setTableRow(dataDistribution.slice(initSlice, initSlice + tablePagination.perPage));
    }
  }, [tablePagination, dataDistribution]);

  const onSelectStatsOptions = (event, selection, isPlaceholder) => {
    if (selection === t('caches.cache-metrics.data-distribution-option-entries'))
      setStatsOption(DataDistributionStatsOption.TotalEntries);
    else if (selection === t('caches.cache-metrics.data-distribution-option-memory-entries'))
      setStatsOption(DataDistributionStatsOption.MemoryEntries);
    else if (selection === t('caches.cache-metrics.data-distribution-option-memory-used'))
      setStatsOption(DataDistributionStatsOption.MemoryUsed);
    setIsOpenStatsOptions(false);
  };

  const onPerPageSelect = (event, selection) => {
    setTablePagination({
      page: 1,
      perPage: selection
    });
  };

  const onSetPage = (event, selection) => {
    setTablePagination({
      ...tablePagination,
      page: selection
    });
  };

  const buildCardContent = () => {
    if (loading && !dataDistribution) {
      return <Spinner size={'lg'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    // Find max domain
    let maxDomain = 1;
    let size = 0;
    if (dataDistribution) {
      size = dataDistribution.length;
      if (statsOption === DataDistributionStatsOption.TotalEntries) {
        maxDomain = dataDistribution.reduce((max, entry) => {
          return Math.max(max, entry.total_entries);
        }, 1);
      } else if (statsOption === DataDistributionStatsOption.MemoryEntries) {
        maxDomain = dataDistribution.reduce((max, entry) => {
          return Math.max(max, entry.memory_entries);
        }, 1);
      } else if (statsOption === DataDistributionStatsOption.MemoryUsed) {
        maxDomain = dataDistribution.reduce((max, entry) => {
          return Math.max(max, entry.memory_used);
        }, 1);
      }
    }

    const data = dataDistribution?.map((item, index) => {
      const yaxis =
        statsOption === DataDistributionStatsOption.TotalEntries
          ? item.total_entries
          : statsOption === DataDistributionStatsOption.MemoryEntries
          ? item.memory_entries
          : item.memory_used;
      return {
        name: 'N ' + index + ': ' + item.node_name,
        y: yaxis > 0 ? yaxis : 0,
        x: 'N ' + index + ':' + item.node_name
      };
    });

    const columnNames = {
      nodeName: t('caches.cache-metrics.data-distribution-node-name'),
      entries: t('caches.cache-metrics.data-distribution-option-entries'),
      memory_entries: t('caches.cache-metrics.data-distribution-option-memory-entries'),
      memory_used: t('caches.cache-metrics.data-distribution-option-memory-used')
    };

    const distributionTable = (
      <div style={{ height: '480px', margin: 'auto' }}>
        <Toolbar id="distribution-table-toolbar">
          <ToolbarContent>
            <ToolbarItem variant={ToolbarItemVariant.pagination}>
              <Pagination
                perPageOptions={[
                  { title: '5', value: 5 },
                  { title: '10', value: 10 }
                ]}
                itemCount={size}
                perPage={tablePagination.perPage}
                page={tablePagination.page}
                onSetPage={onSetPage}
                widgetId="distribution-table-pagination"
                onPerPageSelect={onPerPageSelect}
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <TableComposable
          aria-label={t('caches.cache-metrics.data-distribution-table')}
          variant={TableVariant.compact}
          borders
        >
          <Thead>
            <Tr>
              <Th>{columnNames.nodeName}</Th>
              <Th>{columnNames.entries}</Th>
              <Th>{columnNames.memory_entries}</Th>
              <Th>{columnNames.memory_used}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableRow?.map((row) => (
              <Tr key={row.node_name}>
                <Td dataLabel={columnNames.nodeName}>{row.node_name}</Td>
                <Td dataLabel={columnNames.entries}>{row.total_entries}</Td>
                <Td dataLabel={columnNames.memory_entries}>{row.memory_entries}</Td>
                <Td dataLabel={columnNames.memory_used}>{row.memory_used}</Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </div>
    );

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
          legendData={[
            {
              name:
                statsOption === DataDistributionStatsOption.MemoryUsed
                  ? t('caches.cache-metrics.data-distribution-option-memory-used')
                  : statsOption === DataDistributionStatsOption.TotalEntries
                  ? t('caches.cache-metrics.data-distribution-option-entries')
                  : t('caches.cache-metrics.data-distribution-option-memory-entries')
            }
          ]}
          legendOrientation="horizontal"
          legendPosition="bottom"
          height={350}
          padding={{
            bottom: 10,
            left: 250, // Adjusted to accommodate y axis label
            right: 50, // Adjusted to accommodate legend
            top: 0
          }}
          width={700}
        >
          <ChartGroup offset={11} horizontal>
            <ChartBar data={data} />
          </ChartGroup>
        </Chart>
      </div>
    );

    return size <= MAX_NUMBER_FOR_CHART ? distributionChart : distributionTable;
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
          <SelectOption key={0} value={t('caches.cache-metrics.data-distribution-option-entries')} />
          <SelectOption key={1} value={t('caches.cache-metrics.data-distribution-option-memory-entries')} />
          <SelectOption
            hidden={!displayMemoryUsed}
            key={2}
            value={t('caches.cache-metrics.data-distribution-option-memory-used')}
          />
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
          {dataDistribution && dataDistribution.length <= MAX_NUMBER_FOR_CHART && buildStatsOption()}
        </Level>
      </CardTitle>
      <CardBody>{buildCardContent()}</CardBody>
    </Card>
  );
};

export { DataDistributionChart };
