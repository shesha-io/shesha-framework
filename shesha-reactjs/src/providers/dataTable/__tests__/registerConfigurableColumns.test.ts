import { IAsyncStorage } from '@/configuration-studio/storage';
import { IDataColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { DatasetInstance } from '../instance';
import { DatatableInitArgs } from '../models';
import { IRepository } from '../repository/interfaces';

const makeRepository = (fetchImpl?: () => Promise<never> | Promise<object>): IRepository => ({
  repositoryType: 'test',
  entityType: 'Test.Entity',
  fetch: vi.fn(fetchImpl ?? (() => Promise.resolve({ rows: [], totalPages: 0, totalRows: 0, totalRowsBeforeFilter: 0 }))),
  prepareColumns: vi.fn().mockResolvedValue([]),
  exportToExcel: vi.fn(),
  reorder: vi.fn(),
  performCreate: vi.fn(),
  performUpdate: vi.fn(),
  performDelete: vi.fn(),
} as unknown as IRepository);

const makeStorage = (): IAsyncStorage => ({
  getAsync: vi.fn().mockResolvedValue(undefined),
  setAsync: vi.fn().mockResolvedValue(undefined),
  removeAsync: vi.fn().mockResolvedValue(undefined),
  clearAsync: vi.fn().mockResolvedValue(undefined),
  hasAsync: vi.fn().mockResolvedValue(false),
  getKeysAsync: vi.fn().mockResolvedValue([]),
});

const initArgs: DatatableInitArgs = {
  metadata: undefined,
  userConfigId: undefined,
  sortMode: 'standard',
  dataFetchingMode: 'paging',
};

const column = (propertyName: string, sortOrder = 0): IDataColumnsProps => ({
  id: propertyName,
  caption: propertyName,
  columnType: 'data',
  itemType: 'item',
  sortOrder,
  isVisible: true,
  propertyName,
  accessor: propertyName,
  allowSorting: false,
});

const makeInstance = (repository: IRepository): DatasetInstance =>
  new DatasetInstance({ repository, logEnabled: false, storage: makeStorage() });

describe('registerConfigurableColumns', () => {
  it('fetches on first registration and exposes the set via state.configurableColumns', async () => {
    const repository = makeRepository();
    const instance = makeInstance(repository);
    await instance.init(initArgs);
    const fetchesAfterInit = vi.mocked(repository.fetch).mock.calls.length;

    const columns = [column('name'), column('price', 1)];
    await instance.registerConfigurableColumns('owner-1', columns);

    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(fetchesAfterInit + 1);
    expect(instance.state.configurableColumns).toEqual(columns);
  });

  it('skips re-init and refetch when an identical set is re-registered (remounted consumer)', async () => {
    const repository = makeRepository();
    const instance = makeInstance(repository);
    await instance.init(initArgs);

    await instance.registerConfigurableColumns('owner-1', [column('name')]);
    const fetches = vi.mocked(repository.fetch).mock.calls.length;

    // a remount registers a structurally identical set with a fresh array identity
    await instance.registerConfigurableColumns('owner-1', [column('name')]);
    await instance.registerConfigurableColumns('owner-1', [column('name')]);

    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(fetches);
  });

  it('does not retry a failing fetch when the same columns are re-registered (error loop)', async () => {
    const repository = makeRepository(() => Promise.reject(new Error('400: invalid filter')));
    const instance = makeInstance(repository);
    await instance.init(initArgs);

    await instance.registerConfigurableColumns('owner-1', [column('name')]);
    const fetches = vi.mocked(repository.fetch).mock.calls.length;
    expect(instance.state.fetchTableDataError).toBeDefined();

    await instance.registerConfigurableColumns('owner-1', [column('name')]);

    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(fetches);
  });

  it('re-inits and refetches when a different set is registered', async () => {
    const repository = makeRepository();
    const instance = makeInstance(repository);
    await instance.init(initArgs);

    await instance.registerConfigurableColumns('owner-1', [column('name')]);
    const fetches = vi.mocked(repository.fetch).mock.calls.length;

    await instance.registerConfigurableColumns('owner-1', [column('name'), column('price', 1)]);

    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(fetches + 1);
    expect(instance.state.configurableColumns).toHaveLength(2);
  });

  it('retries a registration whose prepareColumns failed instead of skipping it', async () => {
    const repository = makeRepository();
    const instance = makeInstance(repository);
    await instance.init(initArgs);

    vi.mocked(repository.prepareColumns).mockRejectedValueOnce(new Error('transient network error'));
    await expect(instance.registerConfigurableColumns('owner-1', [column('name')])).rejects.toThrow('transient network error');
    expect(instance.state.configurableColumns).toEqual([]);
    const fetches = vi.mocked(repository.fetch).mock.calls.length;

    // the failed attempt must not make an identical retry a no-op
    await instance.registerConfigurableColumns('owner-1', [column('name')]);

    expect(instance.state.configurableColumns).toEqual([column('name')]);
    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(fetches + 1);
  });

  it('processes a first registration of an empty set (table with no configured columns)', async () => {
    const repository = makeRepository();
    const instance = makeInstance(repository);
    await instance.init(initArgs);
    const fetches = vi.mocked(repository.fetch).mock.calls.length;

    await instance.registerConfigurableColumns('owner-1', []);
    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(fetches + 1);

    // but an identical empty re-registration is still deduplicated
    await instance.registerConfigurableColumns('owner-1', []);
    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(fetches + 1);
  });

  it('picks up columns registered before init and fetches once (DataContext DataList first load)', async () => {
    const repository = makeRepository();
    const instance = makeInstance(repository);

    const columns = [column('name')];
    await instance.registerConfigurableColumns('owner-1', columns);
    expect(vi.mocked(repository.fetch)).not.toHaveBeenCalled();

    await instance.init(initArgs);

    expect(vi.mocked(repository.fetch).mock.calls.length).toBe(1);
    expect(instance.state.configurableColumns).toEqual(columns);
    // the registered set survives as prepared table columns
    expect(instance.state.columns.length).toBeGreaterThan(0);
  });
});
