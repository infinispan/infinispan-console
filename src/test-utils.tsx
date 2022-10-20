import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React, { FunctionComponent } from 'react';
import { Router } from 'react-router';
import i18n from './i18n4Test';
import { I18nextProvider } from 'react-i18next';

export function renderWithRouter(ui, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {}) {
  const Wrapper: FunctionComponent = ({ children }) => (
    <Router history={history}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </Router>
  );
  return {
    ...render(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history
  };
}
