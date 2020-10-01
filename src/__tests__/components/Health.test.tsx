import { Health } from '@app/Common/Health';
import { ComponentHealth } from '@services/utils';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Health Component Test', () => {
  test('by default both health label and icon are displayed', () => {
    render(<Health health={ComponentHealth.HEALTHY} />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.queryByTestId('HealthIcon')).toBeInTheDocument();
  });

  test('when displayIcon is true health label and icon are displayed', () => {
    render(<Health health={ComponentHealth.HEALTHY} displayIcon={true} />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.queryByTestId('HealthIcon')).toBeInTheDocument();
  });

  test('when displayIcon is false only the health label is displayed', () => {
    render(<Health health={ComponentHealth.HEALTHY} displayIcon={false} />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.queryByTestId('HealthIcon')).toBeNull();
  });
});
