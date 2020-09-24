import React from 'react';
import { render, screen } from '@testing-library/react';
import * as StatsHook from '@app/services/statsHook';
import { GlobalStats } from '@app/GlobalStats/GlobalStats';
import { renderWithRouter } from '../../test-utils';

jest.mock('@app/services/statsHook');
const mockedStatsHook = StatsHook as jest.Mocked<typeof StatsHook>;

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

beforeEach(() => {
  mockedStatsHook.fetchGlobalStats.mockClear();
});

describe('Global stats page', () => {
  test('render a non stats enabled message when stats are not enabled', () => {
    mockedStatsHook.fetchGlobalStats.mockImplementationOnce(() => {
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
    expect(screen.queryByText('Statistics disabled')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Explicitly enable JMX statistics globally to display them'
      )
    ).toBeInTheDocument();
  });

  test('render stats when statistics are enabled', () => {
    mockedStatsHook.fetchGlobalStats.mockImplementationOnce(() => {
      return {
        loading: false,
        stats: statsEnabledResponse,
        error: '',
      };
    });

    renderWithRouter(<GlobalStats />);

    expect(
      screen.getByRole('heading', { name: 'Global statistics' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Cluster Content' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Data access' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Operations Performance' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Cache Manager Lifecycle' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'View all caches' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'View Cluster Status' })
    ).toBeInTheDocument();

    expect(screen.queryByText('Statistics disabled')).not.toBeInTheDocument();
    expect(
      screen.getByText('JMX statistics are globally enabled')
    ).toBeInTheDocument();
  });
});
