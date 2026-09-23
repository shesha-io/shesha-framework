import { PropsWithChildren, ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import DataContextBinder from '../dataContextBinder';
import { GetShaContextDataAccessor } from '../contexts/contextDataAccessor';
import { IShaDataWrapper } from '../contexts/shaDataAccessProxy';
import { ContextSetFieldValue, useDataContext } from '../contexts';

interface IProbeData {
  probeField?: string;
}

const onChangeContextData = vi.fn();

vi.mock('@/providers/dataContextManager/hooks', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDataContextManagerActions: () => ({
    onChangeContext: vi.fn(),
    onChangeContextData,
  }),
  useDataContextRegister: vi.fn(),
}));

vi.mock('@/providers', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useMetadataDispatcher: () => ({
    registerModel: vi.fn(),
    updateModel: vi.fn(),
  }),
  MetadataProvider: ({ children }: PropsWithChildren): ReactElement => <>{children}</>,
}));

/**
 * Reproduces the exact shape DataContextProvider builds for appContext/pageContext/formContext:
 * a live CreateDataAccessor proxy as `data`/`getData`, plus a small `api` object merged in via
 * `flattenApi` (this is how the blocking-loader feature exposes showLoader/hideLoaders on every
 * context). Regression: getFull() used to lose setFieldValue/getFieldValue/setData/getData when
 * flattening, because the accessor Proxy's `ownKeys` trap only reflects the underlying data's
 * keys, not the accessor's own methods - so `{ ...data, ...api }` silently dropped them.
 */
const CaptureFull = ({ onFull }: { onFull: (full: ReturnType<typeof useDataContext>['getFull']) => void }): null => {
  const { getFull } = useDataContext();
  onFull(getFull);
  return null;
};

describe('DataContextBinder getFull() with flattenApi', () => {
  it('keeps setFieldValue/getFieldValue/setData/getData usable after flattening an api onto the context', async () => {
    onChangeContextData.mockClear();
    const accessor = GetShaContextDataAccessor<IProbeData>(vi.fn()) as IShaDataWrapper<IProbeData>;

    let getFull: ReturnType<typeof useDataContext>['getFull'] | undefined;

    render(
      <DataContextBinder<IProbeData>
        id="appContext"
        name="appContext"
        type="app"
        data={accessor}
        getData={accessor.getData}
        setData={accessor.setData}
        setFieldValue={accessor.setFieldValue}
        flattenApi
        api={{ showLoader: vi.fn(), hideLoaders: vi.fn() }}
      >
        <CaptureFull onFull={(full) => {
          getFull = full;
        }}
        />
      </DataContextBinder>,
    );

    await waitFor(() => expect(getFull).toBeDefined());

    const full = getFull!();

    expect(typeof full.setFieldValue).toBe('function');
    expect(typeof full['getFieldValue']).toBe('function');
    expect(typeof full['setData']).toBe('function');
    expect(typeof full['getData']).toBe('function');
    // the loader api must still be reachable - that's the point of flattenApi
    expect(typeof full.showLoader).toBe('function');

    // exercise it exactly as a form script does: contexts.appContext.setFieldValue(...)
    const setFieldValue = full.setFieldValue as ContextSetFieldValue<IProbeData> | undefined;
    expect(() => setFieldValue?.('probeField', 'hello')).not.toThrow();
    expect(onChangeContextData).toHaveBeenCalled();
  });

  it('reaches the live accessor Proxy on a direct field assignment (contexts.appContext.probeField = ...)', async () => {
    onChangeContextData.mockClear();
    const accessor = GetShaContextDataAccessor<IProbeData>(vi.fn()) as IShaDataWrapper<IProbeData>;

    let getFull: ReturnType<typeof useDataContext>['getFull'] | undefined;

    render(
      <DataContextBinder<IProbeData>
        id="appContext"
        name="appContext"
        type="app"
        data={accessor}
        getData={accessor.getData}
        setData={accessor.setData}
        setFieldValue={accessor.setFieldValue}
        flattenApi
        api={{ showLoader: vi.fn(), hideLoaders: vi.fn() }}
      >
        <CaptureFull onFull={(full) => {
          getFull = full;
        }}
        />
      </DataContextBinder>,
    );

    await waitFor(() => expect(getFull).toBeDefined());

    const full = getFull!() as unknown as IProbeData;

    // a form script writing straight through the flattened full context...
    full.probeField = 'direct write';

    // ...must reach the live accessor, not just a snapshot object
    expect(accessor.getData().probeField).toBe('direct write');
    expect(onChangeContextData).toHaveBeenCalled();
  });
});
