import React from 'react';
import { render, screen } from '@testing-library/react';
import * as BannerHook from '@app/utils/useApiAlert';
import { BannerAlert } from '@app/Common/BannerAlert';

jest.mock('@app/utils/useApiAlert');
const mockedBannerHook = BannerHook as jest.Mocked<typeof BannerHook>;

describe('Banner Alert Test', () => {
  test('the banner is displayed if there is a message', () => {
    mockedBannerHook.useBanner.mockImplementation(() => {
      return {
        banner: 'There is a big bug',
        setBanner: (string) => {},
      };
    });

    render(<BannerAlert />);
    expect(screen.getByText('There is a big bug')).toBeInTheDocument();
    expect(screen.queryByTestId('NoBanner')).toBeNull();
  });

  test('do not display the banner if there is not message', () => {
    mockedBannerHook.useBanner.mockImplementation(() => {
      return {
        banner: '',
        setBanner: (string) => {},
      };
    });

    render(<BannerAlert />);
    expect(screen.queryByTestId('NoBanner')).toBeInTheDocument();
  });
});
