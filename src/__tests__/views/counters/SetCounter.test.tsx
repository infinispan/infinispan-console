import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SetCounter } from '@app/Counters/SetCounter';
import * as SetCounterHook from '@app/services/countersHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/countersHook');
const mockedCounterHook = SetCounterHook as jest.Mocked<typeof SetCounterHook>;

let closeModalCalls;
let onSetCounterCalls;
let submitModalCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onSetCounterCalls = 0;
  submitModalCalls = 0;
});

mockedCounterHook.useSetCounter.mockImplementation(() => {
  return {
    onSetCounter: () => onSetCounterCalls++
  };
});

describe('Set counter', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <SetCounter
        name={'count-1'}
        value={5}
        isValid={true}
        setValue
        submitModal={() => submitModalCalls++}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(onSetCounterCalls).toBe(0);
  });

  test('render the dialog with invalid delta', () => {
    renderWithRouter(
      <SetCounter
        name={'count-1'}
        value={5}
        isValid={false}
        setValue
        submitModal={() => submitModalCalls++}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(submitButton);

    expect(screen.getByText('cache-managers.counters.modal-set-helper-invalid')).toBeTruthy();
    expect(closeModalCalls).toBe(0);
    expect(onSetCounterCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(
      <SetCounter
        name={'count-1'}
        value={5}
        isValid={true}
        setValue
        submitModal={() => submitModalCalls++}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
      />
    );

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(closeModalCalls).toBe(2);

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(submitButton);
    expect(onSetCounterCalls).toBe(1);
    expect(submitModalCalls).toBe(1);

    // Expect value to be 5
    expect(screen.getByDisplayValue(5));
  });
});
