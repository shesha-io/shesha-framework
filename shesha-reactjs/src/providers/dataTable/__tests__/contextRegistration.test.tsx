import { act, render, waitFor } from '@testing-library/react';
import { PropsWithChildren, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IDataTableStateContext } from '../interfaces.state';
import { IDatasetInstance } from '../models';
import { IRepository } from '../repository/interfaces';
import { throwError } from '@/utils/errors';

type Binding = { data: IDataTableStateContext; api: IDatasetInstance };

/** Data and api published to the data context on each render of the binder */
const bindings: Binding[] = [];

const lastBinding = (): Binding => bindings[bindings.length - 1] ?? throwError('the data context was not registered');

vi.mock('@/providers/dataContextProvider/dataContextBinder', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  default: (props: PropsWithChildren<{ data: IDataTableStateContext; api: IDatasetInstance }>): ReactNode => {
    bindings.push({ data: props.data, api: props.api });
    return props.children;
  },
}));

vi.mock('@/providers/configurableActionsDispatcher', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useConfigurableAction: (): undefined => undefined,
}));

const { DataTableProviderWithRepository } = await import('../provider');

const makeRepository = (): IRepository => ({
  repositoryType: 'test',
  fetchingSettingsHash: '',
  prepareColumns: vi.fn().mockResolvedValue([]),
  fetch: vi.fn().mockResolvedValue({ rows: [], totalPages: 0, totalRows: 0, totalRowsBeforeFilter: 0 }),
  exportToExcel: vi.fn().mockResolvedValue(undefined),
  reorder: vi.fn().mockResolvedValue(undefined),
  performCreate: vi.fn(),
  performUpdate: vi.fn(),
  performDelete: vi.fn(),
} as unknown as IRepository);

describe('data table context registration', () => {
  it('publishes the current dataset state to the context after the selection changes', async () => {
    bindings.length = 0;

    render(
      <DataTableProviderWithRepository
        repository={makeRepository()}
        dataFetchingMode="paging"
        actionOwnerId="owner-1"
        actionOwnerName="TestTable"
      >
        <div>child</div>
      </DataTableProviderWithRepository>,
    );

    await waitFor(() => expect(bindings.length).toBeGreaterThan(0));
    expect(lastBinding().data.selectedRow).toBeUndefined();

    const api = lastBinding().api;
    act(() => api.setSelectedRow(0, { id: 'row-1' }));

    // the context must expose the new state, not the snapshot taken when the binder mounted -
    // scripts read the selection through it (`contexts.<name>.selectedRow`)
    await waitFor(() => expect(lastBinding().data.selectedRow?.id).toBe('row-1'));
  });
});
