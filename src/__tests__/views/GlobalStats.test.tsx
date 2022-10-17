import React from 'react';
import { render, screen } from '@testing-library/react';
import * as StatsHook from '@app/services/statsHook';
import { GlobalStats } from '@app/GlobalStats/GlobalStats';
import { renderWithRouter } from '../../test-utils';
// import ClusterDistributionChart from "@app/GlobalStats/ClusterDistributionChart";

jest.mock('@app/services/statsHook');
jest.mock('@app/GlobalStats/ClusterDistributionChart', () => 'ClusterDistributionChart');

const mockedStatsHook = StatsHook as jest.Mocked<typeof StatsHook>;

const statsNotEnabledResponse = {
  statistics_enabled: false,
  hits: -1,
  retrievals: -1,
  remove_misses: -1,
  remove_hits: -1,
  evictions: -1,
  stores: -1,
  misses: -1
} as CacheManagerStats;

const statsEnabledResponse = {
  statistics_enabled: true,
  hits: -1,
  retrievals: -1,
  remove_misses: -1,
  remove_hits: -1,
  evictions: -1,
  stores: -1,
  misses: -1
} as CacheManagerStats;

beforeEach(() => {
  mockedStatsHook.useFetchGlobalStats.mockClear();
});

describe('Global stats page', () => {
  test('render a non stats enabled message when stats are not enabled', () => {
    mockedStatsHook.useFetchGlobalStats.mockImplementationOnce(() => {
      return {
        loading: false,
        stats: statsNotEnabledResponse,
        error: ''
      };
    });

    render(<GlobalStats />);
    expect(screen.getByRole('heading', { name: 'global-stats.title' })).toBeInTheDocument();
    expect(screen.queryByText('global-stats.global-stats-disable-msg')).toBeInTheDocument();
    expect(screen.queryByText('global-stats.global-stats-disabled-help')).toBeInTheDocument();
  });

  test('render stats when statistics are enabled', () => {
    mockedStatsHook.useFetchGlobalStats.mockImplementationOnce(() => {
      return {
        loading: false,
        stats: statsEnabledResponse,
        error: ''
      };
    });

    renderWithRouter(<GlobalStats />);

    expect(screen.getByRole('heading', { name: 'global-stats.title' })).toBeInTheDocument();
    expect(screen.queryByText('global-stats.cluster-wide-stats')).toBeInTheDocument();
    expect(screen.queryByText('global-stats.data-access-stats')).toBeInTheDocument();
    expect(screen.queryByText('global-stats.operation-performance-values')).toBeInTheDocument();
    expect(screen.queryByText('global-stats.cache-manager-lifecycle')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'global-stats.view-caches-link' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'global-stats.view-cluster-membership-link' })).toBeInTheDocument();
    expect(screen.getByText('global-stats.global-stats-enable-msg')).toBeInTheDocument();
  });
});
