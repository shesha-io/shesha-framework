import { renderHook, waitFor } from '@testing-library/react';
import { useEntitySelectionData } from '@/utils/entity';

const get = vi.fn();
const httpClient = { get };
vi.mock('@/providers', () => ({ useHttpClient: () => httpClient }));

const respondWith = (items: object[]): void => {
  get.mockReset();
  get.mockImplementation(() => Promise.resolve({ data: { success: true, result: { items, totalCount: items.length } } }));
};

describe('useEntitySelectionData', () => {
  it.each([
    ['all entities found', [{ id: 'a', status: 1 }]],
    ['no entities found', []],
  ])('fetches once when the selection is a new array on every render (%s)', async (_, items) => {
    respondWith(items);
    const { result } = renderHook(() => useEntitySelectionData({
      entityType: { name: 'Organisation', module: 'Shesha' },
      propertyName: 'status',
      selection: ['a'],
    }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(get).toHaveBeenCalledTimes(1);
  });
  it('fetches once per display property when the property changes and the selection is rebuilt on every render', async () => {
    respondWith([{ id: 'a', name: 'A', contactEmail: null }]);
    const { result, rerender } = renderHook(
      ({ propertyName }) => useEntitySelectionData({
        entityType: { name: 'Organisation', module: 'Shesha' },
        propertyName,
        selection: ['a'],
      }),
      { initialProps: { propertyName: 'name' } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ propertyName: 'contactEmail' });
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(get).toHaveBeenCalledTimes(2);
    expect(result.current.rows).toEqual([{ id: 'a', contactEmail: null }]);
  });

  it('ignores a response that arrives after the display property has changed', async () => {
    get.mockReset();
    let resolveFirst: (v: unknown) => void = () => undefined;
    get
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveFirst = resolve;
      }))
      .mockImplementation(() => Promise.resolve({ data: { success: true, result: { items: [{ id: 'a', contactEmail: 'new@x' }], totalCount: 1 } } }));

    const { result, rerender } = renderHook(
      ({ propertyName }) => useEntitySelectionData({
        entityType: { name: 'Organisation', module: 'Shesha' },
        propertyName,
        selection: ['a'],
      }),
      { initialProps: { propertyName: 'name' } },
    );
    rerender({ propertyName: 'contactEmail' });
    await waitFor(() => expect(result.current.rows).toEqual([{ id: 'a', contactEmail: 'new@x' }]));

    resolveFirst({ data: { success: true, result: { items: [{ id: 'a', name: 'stale' }], totalCount: 1 } } });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current.rows).toEqual([{ id: 'a', contactEmail: 'new@x' }]);
    expect(result.current.loading).toBe(false);
  });
});
