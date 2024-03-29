import { DeleteCounter } from '@app/Counters/DeleteCounter';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as DeleteCounterHook from '@app/services/countersHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/countersHook');
const mockedCounterHook = DeleteCounterHook as jest.Mocked<typeof DeleteCounterHook>;

let closeModalCalls;
let onDeleteCalls;
let submitModalCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onDeleteCalls = 0;
  submitModalCalls = 0;
});

mockedCounterHook.useDeleteCounter.mockImplementation(() => {
  return {
    onDelete: () => onDeleteCalls++
  };
});

describe('Delete counter', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <DeleteCounter
        name={'count-1'}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
        submitModal={() => submitModalCalls++}
        isDisabled={false}
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(onDeleteCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(
      <DeleteCounter
        name={'count-1'}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
        submitModal={() => submitModalCalls++}
        isDisabled={false}
      />
    );

    expect(mockedCounterHook.useDeleteCounter).toHaveBeenCalledWith('count-1');

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(closeModalCalls).toBe(2);

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);
    expect(submitModalCalls).toBe(1);
    expect(onDeleteCalls).toBe(1);
  });
});
