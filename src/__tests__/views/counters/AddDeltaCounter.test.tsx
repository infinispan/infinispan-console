import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AddDeltaCounter } from '@app/Counters/AddDeltaCounter';
import * as AddDeltaCounterHook from '@app/services/countersHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/countersHook');
const mockedCounterHook = AddDeltaCounterHook as jest.Mocked<typeof AddDeltaCounterHook>;

let closeModalCalls;
let onAddDeltaCalls;
let submitModalCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onAddDeltaCalls = 0;
  submitModalCalls = 0;
});

mockedCounterHook.useAddDeltaCounter.mockImplementation(() => {
  return {
    onAddDelta: () => onAddDeltaCalls++
  };
});

describe('Add a delta', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <AddDeltaCounter
        name={'count-1'}
        deltaValue={5}
        isDeltaValid={true}
        setDeltaValue
        submitModal={() => submitModalCalls++}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(onAddDeltaCalls).toBe(0);
  });

  test('render the dialog with invalid delta', () => {
    renderWithRouter(
      <AddDeltaCounter
        name={'count-1'}
        deltaValue={5}
        isDeltaValid={false}
        setDeltaValue
        submitModal={() => submitModalCalls++}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(submitButton);

    expect(screen.getByText('cache-managers.counters.modal-delta-helper-invalid')).toBeTruthy();
    expect(closeModalCalls).toBe(0);
    expect(onAddDeltaCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(
      <AddDeltaCounter
        name={'count-1'}
        deltaValue={5}
        isDeltaValid={true}
        setDeltaValue
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
    expect(onAddDeltaCalls).toBe(1);
    expect(submitModalCalls).toBe(1);

    // Expect delta value to be 5
    expect(screen.getByDisplayValue(5));
  });
});
