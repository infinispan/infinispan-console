import { Support } from '@app/Support/Support';
import React from 'react';
import { render } from '@testing-library/react';

describe('Support page', () => {
  test('should render Support component', () => {
    const view = render(<Support isModalOpen={true} closeModal={() => {}} />);
    expect(view.container.firstChild).toMatchSnapshot();
  });
});
