import React from 'react';
import { SetAvailableCache } from '@app/Caches/SetAvailableCache';

import { fireEvent, screen } from '@testing-library/react';
import * as SetAvailableCacheHook from '@app/services/cachesHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/cachesHook');
const mockedCacheHook = SetAvailableCacheHook as jest.Mocked<typeof SetAvailableCacheHook>;

let closeModalCalls;
let onSetAvailableCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onSetAvailableCalls = 0;
});

mockedCacheHook.useSetAvailableCache.mockImplementation(() => {
  return {
    onSetAvailable: () => onSetAvailableCalls++
  };
});

describe('Set available cache', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <SetAvailableCache cacheName={'cache-1'} isModalOpen={false} closeModal={() => closeModalCalls++} />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onSetAvailableCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(
      <SetAvailableCache cacheName={'cache-1'} isModalOpen={true} closeModal={() => closeModalCalls++} />
    );

    expect(mockedCacheHook.useSetAvailableCache).toHaveBeenCalledWith('cache-1');

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);
    expect(onSetAvailableCalls).toBe(0);

    const setAvailableButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(setAvailableButton);
    expect(onSetAvailableCalls).toBe(1);
  });
});
