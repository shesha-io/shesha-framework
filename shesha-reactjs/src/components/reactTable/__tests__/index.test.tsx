import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ReactTable } from '../index';
import { useConfigurableActionDispatcher, useAvailableConstantsData } from '@/providers';

// Mock the providers
jest.mock('@/providers', () => ({
  useConfigurableActionDispatcher: jest.fn(),
  useAvailableConstantsData: jest.fn(),
}));

// Mock the form utils
jest.mock('@/providers/form/utils', () => ({
  useAvailableConstantsData: jest.fn(),
}));

describe('ReactTable Double Click', () => {
  const mockExecuteAction = jest.fn();
  const mockAllData = {
    form: { formMode: 'readonly' },
    globalState: {},
    selectedRow: { id: 'test-id', name: 'Test Row' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useConfigurableActionDispatcher as jest.Mock).mockReturnValue({
      executeAction: mockExecuteAction,
    });
    (useAvailableConstantsData as jest.Mock).mockReturnValue(mockAllData);
  });

  it('should include selectedRow in evaluation context when double-clicking a row', () => {
    const mockActionConfiguration = {
      actionOwner: 'test',
      actionName: 'testAction',
    };

    const testData = [
      { id: '1', name: 'Row 1' },
      { id: '2', name: 'Row 2' },
    ];

    const testColumns = [
      {
        Header: 'Name',
        accessor: 'name',
        id: 'name',
      },
    ];

    const { container } = render(
      <ReactTable
        data={testData}
        columns={testColumns}
        onRowDoubleClick={mockActionConfiguration}
      />
    );

    // Find and double-click the first row
    const rows = container.querySelectorAll('tr');
    const firstDataRow = rows[1]; // Skip header row
    fireEvent.doubleClick(firstDataRow);

    // Verify that executeAction was called with the correct evaluation context
    expect(mockExecuteAction).toHaveBeenCalledWith({
      actionConfiguration: mockActionConfiguration,
      argumentsEvaluationContext: expect.objectContaining({
        ...mockAllData,
        data: expect.objectContaining({
          original: { id: '1', name: 'Row 1' },
        }),
        selectedRow: { id: '1', name: 'Row 1' },
      }),
    });
  });
}); 