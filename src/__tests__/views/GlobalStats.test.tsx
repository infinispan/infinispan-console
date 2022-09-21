import React from 'react';
import { render, screen } from '@testing-library/react';
import * as StatsHook from '@app/services/statsHook';
import * as ClusterHook from '@app/services/dataDistributionHook';
import { GlobalStats } from '@app/GlobalStats/GlobalStats';
import { renderWithRouter } from '../../test-utils';

jest.mock('@app/services/statsHook');
const mockedStatsHook = StatsHook as jest.Mocked<typeof StatsHook>;
jest.mock('@app/services/dataDistributionHook');
const mockedClusterHook = ClusterHook as jest.Mocked<typeof ClusterHook>;

const statsNotEnabledResponse = {
  statistics_enabled: false,
  hits: -1,
  retrievals: -1,
  remove_misses: -1,
  remove_hits: -1,
  evictions: -1,
  stores: -1,
  misses: -1,
} as CacheManagerStats;

const statsEnabledResponse = {
  statistics_enabled: true,
  hits: -1,
  retrievals: -1,
  remove_misses: -1,
  remove_hits: -1,
  evictions: -1,
  stores: -1,
  misses: -1,
} as CacheManagerStats;

const clusterDistributionResponse = [{
    node_name: 'cluster',
    node_addresses: ['172.17.0.2:7800'],
    memory_available: 100,
    memory_used: 50,
  }] as ClusterDistribution[];

beforeEach(() => {
  mockedStatsHook.useFetchGlobalStats.mockClear();
  mockedClusterHook.useClusterDistribution.mockClear();
});

describe('Global stats page', () => {
  test('render a non stats enabled message when stats are not enabled', () => {
    mockedStatsHook.useFetchGlobalStats.mockImplementationOnce(() => {
      return {
        loading: false,
        stats: statsNotEnabledResponse,
        error: '',
      };
    });

    render(<GlobalStats />);
    expect(
      screen.getByRole('heading', { name: 'Global statistics' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Global statistics disabled')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Statistics are disabled. To enable statistics, set statistics=true in the configuration.'
      )
    ).toBeInTheDocument();
  });

  test('render stats when statistics are enabled', () => {
    mockedStatsHook.useFetchGlobalStats.mockImplementationOnce(() => {
      return {
        loading: false,
        stats: statsEnabledResponse,
        error: '',
      };
    });

    mockedClusterHook.useClusterDistribution.mockImplementationOnce(() => {
      return {
        loadingCluster: false,
        errorCluster: '',
        clusterDistribution: clusterDistributionResponse,
      };
    });

    renderWithRouter(<GlobalStats />);

    expect(
      screen.getByRole('heading', { name: 'Global statistics' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Cluster-wide statistics' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Data access statistics' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Operation performance values' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Cache Manager lifecycle values' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'View all caches' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'View cluster membership' })
    ).toBeInTheDocument();

    expect(screen.queryByText('Global statistics disabled')).not.toBeInTheDocument();
    expect(
      screen.getByText('Global statistics for all caches in the cluster')
    ).toBeInTheDocument();
  });
});
