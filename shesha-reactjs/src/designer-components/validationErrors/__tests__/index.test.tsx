import React from 'react';
import { render } from '@testing-library/react';
import ValidationErrorsComponent from '../index';

// Mock the dependencies
jest.mock('@/providers/form/providers/shaFormProvider', () => ({
  useShaFormInstance: () => ({
    validationErrors: ['Test error message'],
    formMode: 'runtime'
  })
}));

jest.mock('@/providers', () => ({
  useFormData: () => ({
    data: {}
  })
}));

jest.mock('@/components/validationErrors', () => {
  return function MockValidationErrors({ error, className, style }: any) {
    return <div className={className} style={style} data-testid="validation-errors">{error}</div>;
  };
});

describe('ValidationErrorsComponent', () => {
  const mockModel = {
    id: 'test-id',
    type: 'validationErrors',
    className: 'test-class',
    style: {},
    allStyles: { fullStyle: {} }
  };

  test('renders validation errors component in runtime mode', () => {
    const { getByTestId } = render(
      <ValidationErrorsComponent.Factory model={mockModel} />
    );
    
    const validationErrors = getByTestId('validation-errors');
    expect(validationErrors).toBeInTheDocument();
    expect(validationErrors).toHaveTextContent('Test error message');
  });

  test('renders placeholder message in designer mode', () => {
    // Mock designer mode
    jest.doMock('@/providers/form/providers/shaFormProvider', () => ({
      useShaFormInstance: () => ({
        validationErrors: ['Test error message'],
        formMode: 'designer'
      })
    }));

    const { getByTestId } = render(
      <ValidationErrorsComponent.Factory model={mockModel} />
    );
    
    const validationErrors = getByTestId('validation-errors');
    expect(validationErrors).toBeInTheDocument();
    expect(validationErrors).toHaveTextContent('Validation Errors (visible in the runtime only)');
  });
});
