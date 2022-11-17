import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AddDeltaCounter } from '@app/Counters/AddDeltaCounter';
import * as AddDeltaCounterHook from '@app/services/countersHook';

jest.mock('@app/services/countersHook');
const mockedCounterHook = AddDeltaCounterHook as jest.Mocked<typeof AddDeltaCounterHook>;

let closeModalCalls;
let onAddDeltaCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onAddDeltaCalls = 0;
});

mockedCounterHook.useAddDeltaCounter.mockImplementation(() => {
  return {
    onAddDelta: () => onAddDeltaCalls++
  };
});

describe('Add a delta', () => {
  test('not render the dialog if the modal is closed', () => {
    render(
      <AddDeltaCounter
        name={'count-1'}
        deltaValue={5}
        setDeltaValue
        submitModal={() => {}}
        isModalOpen={false}
        closeModal={() => {}}
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onAddDeltaCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    render(
      <AddDeltaCounter
        name={'count-1'}
        deltaValue={5}
        setDeltaValue
        submitModal={() => onAddDeltaCalls++}
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
    expect(onAddDeltaCalls).toBe(2);

    // Expect delta value to be 5
    expect(screen.getByDisplayValue(5));
  });
});
