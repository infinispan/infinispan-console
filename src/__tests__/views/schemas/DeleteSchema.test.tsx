import { DeleteSchema } from '@app/ProtoSchema/DeleteSchema';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import * as DeleteSchemaHook from '@app/services/protobufHooks';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/protobufHooks');
const mockedSchemaHook = DeleteSchemaHook as jest.Mocked<typeof DeleteSchemaHook>;

let closeModalCalls;
let onDeleteCalls;

beforeEach(() => {
  closeModalCalls = 0;
  onDeleteCalls = 0;
});

mockedSchemaHook.useDeleteProtobufSchema.mockImplementation(() => {
  return {
    onDeleteSchema: () => onDeleteCalls++
  };
});

describe('Delete schema', () => {
  test('not render the dialog if the modal is closed', () => {
    renderWithRouter(<DeleteSchema schemaName={'schema-1'} isModalOpen={false} closeModal={() => closeModalCalls++} />);
    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(onDeleteCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    renderWithRouter(<DeleteSchema schemaName={'schema-1'} isModalOpen={true} closeModal={() => closeModalCalls++} />);

    expect(mockedSchemaHook.useDeleteProtobufSchema).toHaveBeenCalledWith('schema-1');

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);

    const cancelButton = screen.getByRole('button', { name: 'cancel-delete-schema-button' });
    fireEvent.click(cancelButton);
    expect(closeModalCalls).toBe(2);

    const confirmButton = screen.getByRole('button', { name: 'confirm-delete-schema-button' });
    fireEvent.click(confirmButton);
    expect(onDeleteCalls).toBe(1);
  });
});
