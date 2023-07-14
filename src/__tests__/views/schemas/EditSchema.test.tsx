import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { EditSchema } from '@app/ProtoSchema/EditSchema';
import * as EditSchemaHook from '@app/services/protobufHooks';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/services/protobufHooks');
const mockedSchemaHook = EditSchemaHook as jest.Mocked<typeof EditSchemaHook>;

let closeModalCalls;
let submitModalCalls;
let onEditSchemaCalls;

beforeEach(() => {
  closeModalCalls = 0;
  submitModalCalls = 0;
  onEditSchemaCalls = 0;
});

mockedSchemaHook.useEditProtobufSchema.mockImplementation(() => {
  return {
    onEditSchema: () => onEditSchemaCalls++
  };
});

describe('Edit schema', () => {
  test('not render the dialog if the modal is closed', () => {
    mockedSchemaHook.useFetchProtobufSchemaContent.mockImplementation(() => {
      return {
        schemaContent: '',
        loading: true,
        error: '',
        setLoading: () => {}
      };
    });

    renderWithRouter(
      <EditSchema
        schemaName={'schema-1'}
        isModalOpen={false}
        closeModal={() => closeModalCalls++}
        submitModal={() => submitModalCalls++}
      />
    );

    expect(screen.queryByRole('modal')).toBeNull();
    expect(closeModalCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(onEditSchemaCalls).toBe(0);
  });

  test('render the dialog with no schema content ', () => {
    mockedSchemaHook.useFetchProtobufSchemaContent.mockImplementation(() => {
      return {
        schemaContent: '',
        loading: true,
        error: '',
        setLoading: () => {}
      };
    });

    renderWithRouter(
      <EditSchema
        schemaName={'schema-1'}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
        submitModal={() => submitModalCalls++}
      />
    );

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);
    expect(screen.getByText('schemas.save-button').closest('button')).toBeDisabled();

    expect(closeModalCalls).toBe(0);
    expect(submitModalCalls).toBe(0);
    expect(onEditSchemaCalls).toBe(0);
  });

  test('render the dialog and buttons work', () => {
    mockedSchemaHook.useFetchProtobufSchemaContent.mockImplementation(() => {
      return {
        schemaContent: 'schema-content',
        loading: true,
        error: '',
        setLoading: () => {}
      };
    });

    renderWithRouter(
      <EditSchema
        schemaName={'schema-1'}
        isModalOpen={true}
        closeModal={() => closeModalCalls++}
        submitModal={() => submitModalCalls++}
      />
    );

    expect(screen.queryByRole('modal')).toBeDefined();
    expect(screen.queryAllByRole('button')).toHaveLength(3);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(closeModalCalls).toBe(1);

    const cancelButton = screen.getByRole('button', { name: 'cancel-edit-schema-button' });
    fireEvent.click(cancelButton);
    expect(closeModalCalls).toBe(2);

    const submitButton = screen.getByRole('button', { name: 'confirm-edit-schema-button' });
    fireEvent.click(submitButton);
    expect(onEditSchemaCalls).toBe(1);
    expect(submitModalCalls).toBe(1);
  });
});
