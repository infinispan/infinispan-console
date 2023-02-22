import { ResetCounter } from '@app/Counters/ResetCounter';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import * as ResetCounterHook from '@app/services/countersHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/countersHook');
const mockedCounterHook = ResetCounterHook as jest.Mocked<typeof ResetCounterHook>;

let closeModalCalls;
let onResetCalls;
let submitModalCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onResetCalls = 0;
  submitModalCalls = 0;
});

mockedCounterHook.useResetCounter.mockImplementation(() => {
  return {
    onResetCounter: () => onResetCalls++
  };
});

describe('Reset counter', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <ResetCounter
        name={'count-1'}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
        submitModal={() => submitModalCalls++}
        initialValue="5"
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(onResetCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(
      <ResetCounter
        name={'count-1'}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
        submitModal={() => submitModalCalls++}
        initialValue="5"
      />
    );

    expect(mockedCounterHook.useResetCounter).toHaveBeenCalledWith('count-1');

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(closeModalCalls).toBe(2);

    const confirmButton = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(confirmButton);
    expect(submitModalCalls).toBe(1);
    expect(onResetCalls).toBe(1);
  });
});
