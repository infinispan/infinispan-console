import React from 'react';
import { screen } from '@testing-library/react';
import { SchemaEditPage } from '@app/ProtoSchema/SchemaEditPage';
import * as ProtobufHooks from '@app/hooks/protobufHooks';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/hooks/protobufHooks');
const mockedHooks = ProtobufHooks as jest.Mocked<typeof ProtobufHooks>;

(mockedHooks.useDeleteProtobufSchema as jest.Mock).mockReturnValue({
  onDeleteSchema: jest.fn(() => Promise.resolve()),
});

const mockSchemaDetail = {
  name: 'test.proto',
  content: 'syntax = "proto3";\n\nmessage Person {\n  string name = 1;\n}',
  caches: ['cache1', 'cache2'],
  error: null,
};

const mockSchemaDetailWithErrors = {
  name: 'test.proto',
  content: 'syntax = "proto3";\n\nmessage Person {\n  invalid syntax here\n}',
  caches: ['cache1'],
  error: {
    message: 'Syntax error in schema',
    cause: 'Invalid field definition at line 4',
  },
};

const mockSchemaDetailNoCaches = {
  name: 'test.proto',
  content: 'syntax = "proto3";\n\nmessage Person {\n  string name = 1;\n}',
  caches: [],
  error: null,
};

describe('SchemaEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner while fetching', () => {
    mockedHooks.useFetchProtobufSchemaDetailed.mockReturnValue({
      schemaDetail: null,
      loading: true,
      error: '',
      reload: jest.fn(),
    });

    renderWithRouter({
      element: <SchemaEditPage />,
      path: '/schemas/test.proto',
    });

    expect(screen.getByRole('progressbar')).toBeDefined();
    expect(screen.queryByText('schemas.edit-page.title')).toBeNull();
  });

  test('renders error alert on fetch failure', () => {
    const errorMessage = 'Failed to fetch schema';
    mockedHooks.useFetchProtobufSchemaDetailed.mockReturnValue({
      schemaDetail: null,
      loading: false,
      error: errorMessage,
      reload: jest.fn(),
    });

    renderWithRouter({
      element: <SchemaEditPage />,
      path: '/schemas/test.proto',
    });

    expect(screen.getByText(errorMessage)).toBeDefined();
    expect(screen.queryByText('schemas.edit-page.title')).toBeNull();
  });

  test('renders editor with schema content and dependent caches with warning banner', () => {
    mockedHooks.useFetchProtobufSchemaDetailed.mockReturnValue({
      schemaDetail: mockSchemaDetail,
      loading: false,
      error: '',
      reload: jest.fn(),
    });

    renderWithRouter({
      element: <SchemaEditPage />,
      path: '/schemas/test.proto',
    });

    expect(screen.getByText('schemas.edit-page.title')).toBeDefined();

    // Warning banner should be present
    expect(
      screen.getByText('schemas.edit-page.warning-dependent-caches'),
    ).toBeDefined();

    // Validation panel should show success
    expect(
      screen.getByText('schemas.edit-page.validation-valid'),
    ).toBeDefined();

    // Dependent caches section
    expect(
      screen.getByText('schemas.edit-page.dependent-caches-description'),
    ).toBeDefined();
    expect(screen.getByText('cache1')).toBeDefined();
    expect(screen.getByText('cache2')).toBeDefined();

    // Buttons should be present
    expect(screen.getByLabelText('save-schema-button')).toBeDefined();
    expect(screen.getByLabelText('cancel-edit-schema-button')).toBeDefined();
  });

  test('renders validation errors when schema has errors', () => {
    mockedHooks.useFetchProtobufSchemaDetailed.mockReturnValue({
      schemaDetail: mockSchemaDetailWithErrors,
      loading: false,
      error: '',
      reload: jest.fn(),
    });

    renderWithRouter({
      element: <SchemaEditPage />,
      path: '/schemas/test.proto',
    });

    expect(screen.getByText('schemas.edit-page.title')).toBeDefined();

    // Validation panel should show errors
    expect(
      screen.getByText('schemas.edit-page.validation-errors'),
    ).toBeDefined();
    expect(screen.getByText('Syntax error in schema')).toBeDefined();
    expect(
      screen.getByText('Invalid field definition at line 4'),
    ).toBeDefined();

    // Should not show validation success
    expect(screen.queryByText('schemas.edit-page.validation-valid')).toBeNull();
  });

  test('shows no dependent caches message when none exist', () => {
    mockedHooks.useFetchProtobufSchemaDetailed.mockReturnValue({
      schemaDetail: mockSchemaDetailNoCaches,
      loading: false,
      error: '',
      reload: jest.fn(),
    });

    renderWithRouter({
      element: <SchemaEditPage />,
      path: '/schemas/test.proto',
    });

    expect(screen.getByText('schemas.edit-page.title')).toBeDefined();

    // Should show no dependent caches message
    expect(
      screen.getByText('schemas.edit-page.no-dependent-caches'),
    ).toBeDefined();

    // Should not show the description for when caches exist
    expect(
      screen.queryByText('schemas.edit-page.dependent-caches-description'),
    ).toBeNull();

    // Warning banner should not be present
    expect(
      screen.queryByText('schemas.edit-page.warning-dependent-caches'),
    ).toBeNull();
  });

  test('cancel button exists and is clickable', () => {
    mockedHooks.useFetchProtobufSchemaDetailed.mockReturnValue({
      schemaDetail: mockSchemaDetail,
      loading: false,
      error: '',
      reload: jest.fn(),
    });

    renderWithRouter({
      element: <SchemaEditPage />,
      path: '/schemas/test.proto',
    });

    const cancelButton = screen.getByLabelText('cancel-edit-schema-button');
    expect(cancelButton).toBeDefined();
    expect(cancelButton).toHaveProperty('disabled', false);
  });
});
