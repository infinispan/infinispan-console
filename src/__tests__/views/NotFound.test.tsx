import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { NotFound } from '@app/NotFound/NotFound';
import { renderWithRouter } from '../../test-utils';

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate
}));

describe('Not found page', () => {
  test('render page and go to home button', () => {
    renderWithRouter(<NotFound />);
    const pageHeading = screen.getByRole('heading', {
      name: 'not-found-page.title'
    });
    const pageDescription = screen.getByText('not-found-page.description');
    const button = screen.getByRole('button', {
      name: 'not-found-page.button'
    });
    expect(pageHeading).toBeInTheDocument();
    expect(pageDescription).toBeInTheDocument();
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
