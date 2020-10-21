import { Support } from '@app/Support/Support';
import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../test-utils';

describe('Support page', () => {
  test('modal shows the children and a close button', () => {
    const handleClose = jest.fn();

    const { getByText, getByRole } = renderWithRouter(
      <Support isModalOpen={true} closeModal={handleClose} />
    );

    expect(getByRole('dialog', { name: 'Unable to log' })).toBeInTheDocument();
    expect(getByText('User not configured')).toBeInTheDocument();
    expect(getByText('Download and run')).toBeInTheDocument();
    expect(getByText('Podman')).toBeInTheDocument();
    expect(getByText('Docker')).toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: 'Close' }));
    fireEvent.click(getByRole('button', { name: 'Reload' }));

    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
