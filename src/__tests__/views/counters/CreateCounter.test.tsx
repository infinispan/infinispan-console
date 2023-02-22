import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreateCounter } from '@app/Counters/CreateCounter';
import * as CreateCounterHook from '@app/services/countersHook';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/countersHook');
const mockedCounterHook = CreateCounterHook as jest.Mocked<typeof CreateCounterHook>;

let closeModalCalls;
let onCreateCounterCalls;
let submitModalCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onCreateCounterCalls = 0;
  submitModalCalls = 0;
});

mockedCounterHook.useCreateCounter.mockImplementation(() => {
  return {
    onCreateCounter: () => onCreateCounterCalls++
  };
});

describe('Create a counter', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(
      <CreateCounter
        submitModal={() => submitModalCalls++}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onCreateCounterCalls).toBe(0);
  });

  test('render the dialog and submit with empty values', () => {
    renderWithRouter(
      <CreateCounter
        submitModal={() => submitModalCalls++}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(5);
  
    //Submiting empty form
    const submitButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(submitButton);
    expect(screen.getByText('cache-managers.counters.modal-counter-name')).toBeTruthy();
    expect(closeModalCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(onCreateCounterCalls).toBe(0);
  });

  test('render the dialog and submit with filled name', () => {
    renderWithRouter(
      <CreateCounter
        submitModal={() => submitModalCalls++}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(5);
  
    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(onCreateCounterCalls).toBe(0);
    //Submiting form with name filled
    const nameInput = screen.getByLabelText('counter-name-input');
    fireEvent.change(nameInput, {target: {value: 'TestCounter'}});
    fireEvent.click(submitButton);

    expect(closeModalCalls).toBe(1);
    expect(onCreateCounterCalls).toBe(1);
    expect(submitModalCalls).toBe(1);
    expect(screen.queryByRole('modal')).toBeNull();
  });

  test('render the dialog and submit with invalid values', () => {
    renderWithRouter(
      <CreateCounter
        submitModal={() => submitModalCalls++}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(5);
  
    const submitButton = screen.getByRole('button', { name: 'Create' });

    //Submiting form with name filled
    const nameInput = screen.getByLabelText('counter-name-input');
    fireEvent.change(nameInput, {target: {value: 'TestCounter1'}});
    const initialValueInput = screen.getByLabelText('initial-value-input');
    fireEvent.change(initialValueInput, {target: {value: '5'}});
    const lowerBoundInput = screen.getByLabelText('lower-bound-input');
    fireEvent.change(lowerBoundInput, {target: {value: '5'}});
    const upperBoundInput = screen.getByLabelText('upper-bound-input');
    fireEvent.change(upperBoundInput, {target: {value: '5'}});
    fireEvent.click(submitButton);
    expect(screen.getByText('cache-managers.counters.modal-initial-value-invalid')).toBeTruthy();
    expect(screen.getByText('cache-managers.counters.modal-lower-bound-invalid')).toBeTruthy();
    expect(closeModalCalls).toBe(0);
    expect(onCreateCounterCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(screen.queryByRole('modal')).toBeDefined();
  });

  test('render the dialog and submit with valid values', () => {
    renderWithRouter(
      <CreateCounter
        submitModal={() => submitModalCalls++}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
      />
    );
    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(5);
  
    const submitButton = screen.getByRole('button', { name: 'Create' });

    //Submiting form with name filled
    const nameInput = screen.getByLabelText('counter-name-input');
    fireEvent.change(nameInput, {target: {value: 'TestCounter1'}});
    const initialValueInput = screen.getByLabelText('initial-value-input');
    fireEvent.change(initialValueInput, {target: {value: '5'}});
    const lowerBoundInput = screen.getByLabelText('lower-bound-input');
    fireEvent.change(lowerBoundInput, {target: {value: '0'}});
    const upperBoundInput = screen.getByLabelText('upper-bound-input');
    fireEvent.change(upperBoundInput, {target: {value: '10'}});
    fireEvent.click(submitButton);

    expect(closeModalCalls).toBe(1);
    expect(onCreateCounterCalls).toBe(1);
    expect(submitModalCalls).toBe(1);
    expect(screen.queryByRole('modal')).toBeNull();
  });

});
