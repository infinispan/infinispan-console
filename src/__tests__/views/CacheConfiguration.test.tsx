import React from 'react';
import { renderWithRouter } from '../../test-utils';
import { screen } from '@testing-library/react';
import * as ConfigHook from '@app/services/configHook';

import { CacheConfiguration } from '@app/Caches/Configuration/CacheConfiguration';

jest.mock('@app/services/configHook');
const mockedConfigHook = ConfigHook as jest.Mocked<typeof ConfigHook>;

const jsonConfig = `{
  "distributed-cache": {
    "mode": "SYNC",
    "statistics": true,
    "encoding": {
      "key": {
        "media-type": "application/x-protostream"
      },
      "value": {
        "media-type": "application/x-protostream"
      }
    }
  }
}`;

const yamlConfig = `distributedCache:
mode: "SYNC"
statistics: "true"
encoding:
  key:
    mediaType: "application/x-protostream"
  value:
    mediaType: "application/x-protostream"`;

const xmlConfig = `<?xml version="1.0"?>
<distributed-cache mode="SYNC" statistics="true">
	<encoding>
		<key media-type="application/x-protostream"/>
		<value media-type="application/x-protostream"/>
	</encoding>
</distributed-cache>`;

describe('Configuration Page', () => {
  test('YAML Configuration testing', () => {
    mockedConfigHook.useFetchConfigurationYAML.mockImplementationOnce(() => {
      return {
        loading: false,
        error: '',
        configuration: yamlConfig,
      };
    });

    renderWithRouter(
      <CacheConfiguration
        cacheName="Test"
        editable={false}
        config={jsonConfig}
      />
    );
    expect(screen.getByRole('button', { name: 'JSON' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'XML' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'YAML' })).toBeInTheDocument();
  });

  test('XML Configuration testing', () => {
    mockedConfigHook.useFetchConfigurationXML.mockImplementationOnce(() => {
      return {
        loading: false,
        error: '',
        configuration: xmlConfig,
      };
    });

    renderWithRouter(
      <CacheConfiguration
        cacheName="Test"
        editable={false}
        config={jsonConfig}
      />
    );
    expect(screen.getByRole('button', { name: 'JSON' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'XML' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'YAML' })).toBeInTheDocument();
  });
});
