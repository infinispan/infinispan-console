import React from 'react';
import { render, screen } from '@testing-library/react';
import * as BannerHook from '@app/utils/useApiAlert';
import { BannerAlert } from '@app/Common/BannerAlert';
import { CACHES_BANNER, ROLLING_UPGRADE_BANNER } from '@app/providers/APIAlertProvider';

jest.mock('@app/utils/useApiAlert');
const mockedBannerHook = BannerHook as jest.Mocked<typeof BannerHook>;

describe('Banner Alert Test', () => {
  test('the banner is displayed if there is a message', () => {
    const bannerMap = new Map();
    bannerMap.set(CACHES_BANNER, 'There is a big bug in a cache');
    bannerMap.set(ROLLING_UPGRADE_BANNER, 'Rolling');
    mockedBannerHook.useBanner.mockImplementation(() => {
      return {
        bannerMap: bannerMap,
        addBanner: (id: string, text: string) => {},
        removeBanner: (string) => {}
      };
    });

    render(<BannerAlert />);
    expect(screen.getByText('There is a big bug in a cache')).toBeDefined();
    expect(screen.getByText('Rolling')).toBeDefined();
    expect(screen.queryByTestId('NoBanner')).toBeNull();
  });

  test('do not display the banner if there is not message', () => {
    mockedBannerHook.useBanner.mockImplementation(() => {
      return {
        bannerMap: new Map(),
        addBanner: (id: string, text: string) => {},
        removeBanner: (string) => {}
      };
    });

    render(<BannerAlert />);
    expect(screen.queryByTestId('NoBanner')).toBeDefined();
  });
});
