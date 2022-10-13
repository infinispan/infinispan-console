import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Level,
  LevelItem,
  Select,
  SelectOption,
  SelectVariant,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
  Pagination
} from '@patternfly/react-core';
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  TableVariant
} from '@patternfly/react-table';
import { Chart, ChartAxis, ChartBar, ChartGroup, ChartVoronoiContainer } from '@patternfly/react-charts';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useClusterDistribution } from '@app/services/dataDistributionHook';
import { ClusterDistributionStatsOption } from '@services/infinispanRefData';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { formatBytes } from '@utils/formatBytes';

const ClusterDistributionChart = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const MAX_NUMBER_FOR_CHART = 5;
  const [isOpenStatsOptions, setIsOpenStatsOptions] = useState<boolean>(false);
  const [statsOption, setStatsOption] = useState<string>(ClusterDistributionStatsOption.MemoryAvailable);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [tableRow, setTableRow] = useState<ClusterDistribution[]>();

  const { clusterDistribution, loadingCluster, errorCluster } =
    useClusterDistribution();

  useEffect(() => {
    if (clusterDistribution) {
      const initSlice = (tablePagination.page - 1) * tablePagination.perPage;
      setTableRow(
        clusterDistribution.slice(
          initSlice,
          initSlice + tablePagination.perPage
        )
      );
    }
  }, [tablePagination, clusterDistribution]);

  const onSelectStatsOptions = (event, selection, isPlaceholder) => {
    if (selection === t('global-stats.cluster-distribution-option-memory-available'))
      setStatsOption(ClusterDistributionStatsOption.MemoryAvailable);
    else if (selection === t('global-stats.cluster-distribution-option-memory-used'))
      setStatsOption(ClusterDistributionStatsOption.MemoryUsed);
    setIsOpenStatsOptions(false);
  };

  const onPerPageSelect = (event, selection) => {
    setTablePagination({
      page: 1,
      perPage: selection,
    });
  };

  const onSetPage = (event, selection) => {
    setTablePagination({
      ...tablePagination,
      page: selection,
    });
  };

  const buildCardContent = () => {
    if (loadingCluster && clusterDistribution === undefined) {
      return <Spinner size={'lg'} />;
    }

    if (errorCluster != '') {
      return <TableErrorState error={errorCluster} />;
    }

    // Find max domain
    let maxDomain = 1;
    let size = 0;
    if (clusterDistribution) {
      size = clusterDistribution.length;
      if (statsOption === ClusterDistributionStatsOption.MemoryAvailable) {
        maxDomain = clusterDistribution.reduce((max, entry) => {
          return Math.max(max, entry.memory_available);
        }, 1);
      } else {
        maxDomain = clusterDistribution.reduce((max, entry) => {
          return Math.max(max, entry.memory_used);
        }, 1);
      }
    }

    const data = clusterDistribution?.map((item, index) => {
      const yaxis = statsOption === ClusterDistributionStatsOption.MemoryAvailable
        ? item.memory_available
        : item.memory_used;
      return {
        name: 'N ' + index + ': ' + item.node_name,
        y: yaxis,
        x: 'N ' + index + ':' + item.node_name,
      };
    });

    const columnNames = {
      nodeName: t('global-stats.cluster-distribution-node-name'),
      memoryAvailable: t('global-stats.cluster-distribution-option-memory-used'),
      memoryUsed: t('global-stats.cluster-distribution-option-memory-available'),
    };

    const clusterTable = (
      <div style={{ height: '480px', margin: 'auto' }}>
        <Toolbar
          style={{ paddingTop: '0' }}
          id="cluster-distribution-table-toolbar"
        >
          <ToolbarContent>
            <ToolbarItem variant={ToolbarItemVariant.pagination}>
              <Pagination
                perPageOptions={[
                  { title: '5', value: 5 },
                  { title: '10', value: 10 },
                ]}
                itemCount={size}
                perPage={tablePagination.perPage}
                page={tablePagination.page}
                onSetPage={onSetPage}
                widgetId="cluster-distribution-table-pagination"
                onPerPageSelect={onPerPageSelect}
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <TableComposable
          aria-label="Cluster Distribution Table"
          variant={TableVariant.compact}
          borders
        >
          <Thead>
            <Tr>
              <Th>{columnNames.nodeName}</Th>
              <Th>{columnNames.memoryAvailable}</Th>
              <Th>{columnNames.memoryUsed}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableRow?.map((row) => (
              <Tr key={row.node_name}>
                <Td dataLabel={columnNames.nodeName}>{row.node_name}</Td>
                <Td dataLabel={columnNames.memoryAvailable}>
                  {row.memory_available}
                </Td>
                <Td dataLabel={columnNames.memoryUsed}>{row.memory_used}</Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </div>
    );

    const clusterChart = (
      <div style={{ height: '470px', width: '700px', margin: 'auto' }}>
        <Chart
          ariaDesc={t('global-stats.cluster-distribution')}
          ariaTitle={t('global-stats.cluster-distribution')}
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => datum.y !== 0
                ? `${datum.y}`
                : `${t('global-stats.cluster-distribution-no-memory')}`
              }
              constrainToVisibleArea
            />
          }
          domain={{ y: [0, maxDomain] }}
          domainPadding={{ x: [30, 25] }}
          legendData={[
            {
              name:
                statsOption === ClusterDistributionStatsOption.MemoryAvailable
                  ? t('global-stats.cluster-distribution-option-memory-available')
                  : t('global-stats.cluster-distribution-option-memory-used'),
            },
          ]}
          legendOrientation="horizontal"
          legendPosition="bottom"
          height={350}
          padding={{
            bottom: 10,
            left: 250, // Adjusted to accommodate y axis label
            right: 50, // Adjusted to accommodate legend
            top: 0,
          }}
          width={700}
        >
          <ChartAxis />
          <ChartAxis dependentAxis tickFormat={(t) => formatBytes(t)} />
          <ChartGroup offset={11} horizontal>
            <ChartBar data={data} />
          </ChartGroup>
        </Chart>
      </div>
    );
    return size < MAX_NUMBER_FOR_CHART ? clusterChart : clusterTable;
  };

  const buildStatsOption = () => {
    return (
      <LevelItem>
        <Select
          variant={SelectVariant.single}
          aria-label="memory-select"
          onToggle={() => setIsOpenStatsOptions(!isOpenStatsOptions)}
          onSelect={onSelectStatsOptions}
          selections={statsOption}
          isOpen={isOpenStatsOptions}
          aria-labelledby="toggle-id-memory"
          toggleId="memorySelector"
          width={'100%'}
          position="right"
        >
          <SelectOption
            key={0}
            value={t('global-stats.cluster-distribution-option-memory-available')}
          />
          <SelectOption
            key={1}
            value={t('global-stats.cluster-distribution-option-memory-used')}
          />
        </Select>
      </LevelItem>
    );
  };

  return (
    <Card>
      <CardTitle>
        <Level id={'cluster-distribution'}>
          <LevelItem>
            <PopoverHelp
              name="cluster-distribution"
              label={t('global-stats.cluster-distribution')}
              content={t('global-stats.cluster-distribution-tooltip')}
              text={t('global-stats.cluster-distribution')}
            />
          </LevelItem>
          {clusterDistribution && clusterDistribution.length < 5 && buildStatsOption()}
        </Level>
      </CardTitle>
      <CardBody>{buildCardContent()}</CardBody>
    </Card>
  );
};

export default ClusterDistributionChart;
