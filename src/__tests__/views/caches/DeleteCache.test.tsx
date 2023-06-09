import { DeleteCache } from '@app/Caches/DeleteCache';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import * as DeleteCacheHook from '@app/services/cachesHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/cachesHook');
const mockedCacheHook = DeleteCacheHook as jest.Mocked<typeof DeleteCacheHook>;

let closeModalCalls;
let onDeleteCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onDeleteCalls = 0;
});

mockedCacheHook.useDeleteCache.mockImplementation(() => {
  return {
    onDelete: () => onDeleteCalls++
  };
});

describe('Delete cache', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(<DeleteCache cacheName={'cache-1'} isModalOpen={false} closeModal={() => closeModalCalls++} />);
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onDeleteCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(<DeleteCache cacheName={'cache-1'} isModalOpen={true} closeModal={() => closeModalCalls++} />);

    expect(mockedCacheHook.useDeleteCache).toHaveBeenCalledWith('cache-1');

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);

    const deleteButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(deleteButton);
    // The hook is not called because it requires a confirming cache name before deleting.
    expect(onDeleteCalls).toBe(0);
  });
});
