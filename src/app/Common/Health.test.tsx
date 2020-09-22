import { Health } from '@app/Common/Health';
import { ComponentHealth } from '@services/utils';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Health Component Test', () => {
  test('Health label is displayed', () => {
    render(<Health health={ComponentHealth.HEALTHY} />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByTestId('HealthIcon')).toBeInTheDocument();
  });
});
