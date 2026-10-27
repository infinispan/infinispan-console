import React from 'react';
import { screen } from '@testing-library/react';
import { ProtobufSchemasDisplay } from '@app/ProtoSchema/ProtobufSchemasDisplay';
import * as ProtobufHooks from '@app/hooks/protobufHooks';
import * as UserHook from '@app/hooks/userManagementHook';
import * as ConsoleServicesModule from '@services/ConsoleServices';
import { renderWithRouter } from '../../../test-utils';

jest.mock('@app/hooks/protobufHooks');
jest.mock('@app/hooks/userManagementHook');
jest.mock('@app/utils/useApiAlert', () => ({
  useApiAlert: () => ({ addAlert: jest.fn() })
}));

const mockedProtobufHooks = ProtobufHooks as jest.Mocked<typeof ProtobufHooks>;
const mockedUserHook = UserHook as jest.Mocked<typeof UserHook>;

(mockedProtobufHooks.useDeleteProtobufSchema as jest.Mock).mockReturnValue({
  onDeleteSchema: jest.fn(() => Promise.resolve())
});

const emptySchemasHook = {
  schemas: [] as ProtoSchema[],
  loading: false,
  reload: jest.fn(),
  error: ''
};

const schemasWithDataHook = {
  schemas: [
    { name: 'person.proto', error: undefined },
    { name: 'address.proto', error: undefined }
  ] as ProtoSchema[],
  loading: false,
  reload: jest.fn(),
  error: ''
};

function mockSecurity(hasAccess: boolean) {
  jest.spyOn(ConsoleServicesModule.ConsoleServices, 'security').mockReturnValue({
    hasConsoleACL: jest.fn().mockReturnValue(hasAccess)
  } as any);
}

describe('ProtobufSchemasDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockedProtobufHooks.useDeleteProtobufSchema as jest.Mock).mockReturnValue({
      onDeleteSchema: jest.fn(() => Promise.resolve())
    });
  });

  test('observer with no schemas should not see create button', () => {
    mockedProtobufHooks.useFetchProtobufSchemas.mockReturnValue(emptySchemasHook);
    (mockedUserHook.useConnectedUser as jest.Mock).mockReturnValue({
      connectedUser: { name: 'observer', acl: { global: ['MONITOR'] } }
    });
    mockSecurity(false);

    renderWithRouter(<ProtobufSchemasDisplay setProtoSchemasCount={jest.fn()} isVisible={true} />);

    expect(screen.getByText('schemas.no-schema-status')).toBeDefined();
    expect(screen.getByText('schemas.no-schema-body')).toBeDefined();
    expect(screen.queryByLabelText('create-schema-button')).toBeNull();
  });

  test('admin with no schemas should see create button', () => {
    mockedProtobufHooks.useFetchProtobufSchemas.mockReturnValue(emptySchemasHook);
    (mockedUserHook.useConnectedUser as jest.Mock).mockReturnValue({
      connectedUser: { name: 'admin', acl: { global: ['CREATE', 'ADMIN', 'MONITOR'] } }
    });
    mockSecurity(true);

    renderWithRouter(<ProtobufSchemasDisplay setProtoSchemasCount={jest.fn()} isVisible={true} />);

    expect(screen.getByText('schemas.no-schema-status')).toBeDefined();
    expect(screen.getByLabelText('create-schema-button')).toBeDefined();
  });

  test('observer with schemas should not see create button in toolbar', () => {
    mockedProtobufHooks.useFetchProtobufSchemas.mockReturnValue(schemasWithDataHook);
    (mockedUserHook.useConnectedUser as jest.Mock).mockReturnValue({
      connectedUser: { name: 'observer', acl: { global: ['MONITOR'] } }
    });
    mockSecurity(false);

    renderWithRouter(<ProtobufSchemasDisplay setProtoSchemasCount={jest.fn()} isVisible={true} />);

    expect(screen.queryByLabelText('create-schema-button')).toBeNull();
    expect(screen.getByText('person.proto')).toBeDefined();
    expect(screen.getByText('address.proto')).toBeDefined();
  });

  test('admin with schemas should see create button in toolbar', () => {
    mockedProtobufHooks.useFetchProtobufSchemas.mockReturnValue(schemasWithDataHook);
    (mockedUserHook.useConnectedUser as jest.Mock).mockReturnValue({
      connectedUser: { name: 'admin', acl: { global: ['CREATE', 'ADMIN', 'MONITOR'] } }
    });
    mockSecurity(true);

    renderWithRouter(<ProtobufSchemasDisplay setProtoSchemasCount={jest.fn()} isVisible={true} />);

    expect(screen.getByLabelText('create-schema-button')).toBeDefined();
    expect(screen.getByText('person.proto')).toBeDefined();
  });

  test('not visible should render empty span', () => {
    mockedProtobufHooks.useFetchProtobufSchemas.mockReturnValue(emptySchemasHook);
    (mockedUserHook.useConnectedUser as jest.Mock).mockReturnValue({
      connectedUser: { name: 'admin', acl: { global: ['CREATE'] } }
    });
    mockSecurity(true);

    renderWithRouter(<ProtobufSchemasDisplay setProtoSchemasCount={jest.fn()} isVisible={false} />);

    expect(screen.queryByText('schemas.no-schema-status')).toBeNull();
    expect(screen.queryByLabelText('create-schema-button')).toBeNull();
  });
});
