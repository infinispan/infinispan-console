import { DeleteCounter } from '@app/Counters/DeleteCounter';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as DeleteCounterHook from '@app/services/countersHook';

jest.mock('@app/services/countersHook');
const mockedCounterHook = DeleteCounterHook as jest.Mocked<typeof DeleteCounterHook>;

let closeModalCalls;
let onDeleteCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onDeleteCalls = 0;
});

mockedCounterHook.useDeleteCounter.mockImplementation(() => {
  return {
    onDelete: () => onDeleteCalls++
  };
});

describe('Delete counter', () => {
  test('not render the dialog if the modal is closed', () => {
    render(<DeleteCounter name={'count-1'} isModalOpen={false} closeModal={() => {}} isDisabled={false} />);
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onDeleteCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    render(
      <DeleteCounter name={'count-1'} isModalOpen={true} closeModal={() => closeModalCalls++} isDisabled={false} />
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
    expect(closeModalCalls).toBe(3);
    expect(onDeleteCalls).toBe(1);
  });
});
