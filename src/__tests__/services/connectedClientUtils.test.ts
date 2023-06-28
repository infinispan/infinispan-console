import { groupConnections } from '@app/utils/connectedClientUtils';

describe('groupConnections', () => {
  it('groups connections based on specific properties', () => {
    const connections: ConnectedClients[] = [
      {
        id: 70,
        'server-node-name': 'infinispan-4-e2e',
        name: 'flower',
        created: '2023-05-18T14:54:37.882566188Z',
        principal: 'admin',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58230',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3'
      },
      {
        id: 71,
        'server-node-name': 'infinispan-4-e2e',
        name: 'car',
        created: '2023-07-05T06:50:45.960705319Z',
        principal: 'admin',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58230',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3'
      },
      {
        id: 72,
        'server-node-name': 'infinispan-4-e2e',
        name: 'school',
        created: '2023-07-05T10:00:54.472232620Z',
        principal: 'observer',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58230',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3'
      },
      {
        id: 73,
        'server-node-name': 'infinispan-4-e2e',
        name: 'office',
        created: '2023-07-05T10:00:53.824309416Z',
        principal: 'admin',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58231',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3'
      },
      {
        id: 74,
        'server-node-name': 'infinispan-4-e2e',
        name: 'bike',
        created: '2023-07-05T10:00:53.824533716Z',
        principal: 'observer',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58230',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3'
      }
    ];

    // Expected output
    const expectedGroupedConnections: ConnectedClients[] = [
      {
        id: 70,
        'server-node-name': 'infinispan-4-e2e',
        name: 'flower',
        created: '2023-05-18T14:54:37.882566188Z',
        principal: 'admin',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58230',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3',
        count: 2
      },
      {
        id: 72,
        'server-node-name': 'infinispan-4-e2e',
        name: 'school',
        created: '2023-07-05T10:00:54.472232620Z',
        principal: 'observer',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58230',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3',
        count: 2
      },
      {
        id: 73,
        'server-node-name': 'infinispan-4-e2e',
        name: 'office',
        created: '2023-07-05T10:00:53.824309416Z',
        principal: 'admin',
        'local-address': '/127.0.0.1:11222',
        'remote-address': '/127.0.0.1:58231',
        'protocol-version': 'RESP3',
        'client-library': 'test',
        'client-version': null,
        'ssl-application-protocol': 'http/1.1',
        'ssl-cipher-suite': 'TLS_AES_256_GCM_SHA384',
        'ssl-protocol': 'TLSv1.3',
        count: 1
      }
    ];

    const result = groupConnections(connections);

    // Assert the result
    expect(result).toEqual(expectedGroupedConnections);
  });
});
