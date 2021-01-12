import React from 'react';
import { fireEvent, getByRole, render } from '@testing-library/react';
import { About } from '@app/About/About';
import * as GetVersionHook from '@app/services/serverHook';

jest.mock('@app/services/serverHook');
const mockedGetVersionHook = GetVersionHook as jest.Mocked<
  typeof GetVersionHook
>;

mockedGetVersionHook.useFetchVersion.mockImplementation(() => {
  return {
    version: 'Infinispan Corona 1.9',
    loading: false,
    error: '',
    setLoading: () => {}
  };
});

describe('About page', () => {
  test('modal shows the children and a close button', () => {
    const handleClose = jest.fn();

    const { getByText, getByRole } = render(
      <About isModalOpen={true} closeModal={handleClose} />
    );

    expect(getByText('Sponsored by Red Hat')).toBeTruthy();

    expect(getByText('Infinispan Corona 1.9')).toBeTruthy();

    expect(getByRole('img', { name: 'Infinispan Logo' })).toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: 'Close Dialog' }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
