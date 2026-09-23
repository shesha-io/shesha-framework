import { PropsWithChildren, ReactElement } from 'react';
import { render, waitFor } from '@testing-library/react';
import DataContextBinder from '../dataContextBinder';
import { GetShaContextDataAccessor } from '../contexts/contextDataAccessor';
import { IShaDataAccessor, IShaDataWrapper } from '../contexts/shaDataAccessProxy';
import {
  ContextGetData,
  ContextGetFieldValue,
  ContextSetData,
  ContextSetFieldValue,
  IDataContextFull,
  useDataContext,
} from '../contexts';

interface IProbeData {
  probeField?: string;
}

/**
 * Narrows a raw accessor to the `TData & IShaDataAccessor<TData>` shape DataContextProvider relies
 * on (a `GetShaContextDataAccessor` result is always this shape at runtime via its Proxy), instead
 * of blindly asserting it with `as IShaDataWrapper<TData>`.
 */
const isShaDataWrapper = <TData extends object>(value: IShaDataAccessor<TData>): value is IShaDataWrapper<TData> =>
  typeof value.getData === 'function' &&
  typeof value.setData === 'function' &&
  typeof value.setFieldValue === 'function' &&
  typeof value.getFieldValue === 'function';

/** The shape `getFull()` must still expose after flattening: the accessor methods plus probe data. */
interface IFlattenedProbeContext extends IDataContextFull, IProbeData {
  setFieldValue: ContextSetFieldValue<IProbeData>;
  getFieldValue: ContextGetFieldValue;
  setData: ContextSetData<IProbeData>;
  getData: ContextGetData<IProbeData>;
}

/** Narrows `getFull()`'s result instead of asserting it with `as unknown as ...`. */
const isFlattenedProbeContext = (value: IDataContextFull): value is IFlattenedProbeContext =>
  typeof value.setFieldValue === 'function' &&
  typeof value['getFieldValue'] === 'function' &&
  typeof value['setData'] === 'function' &&
  typeof value['getData'] === 'function';

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
    const rawAccessor = GetShaContextDataAccessor<IProbeData>(vi.fn());
    expect(isShaDataWrapper(rawAccessor)).toBe(true);
    if (!isShaDataWrapper(rawAccessor)) return;
    const accessor = rawAccessor;

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
    expect(isFlattenedProbeContext(full)).toBe(true);
    if (!isFlattenedProbeContext(full)) return;

    // the loader api must still be reachable - that's the point of flattenApi
    expect(typeof full.showLoader).toBe('function');

    // exercise it exactly as a form script does: contexts.appContext.setFieldValue(...)
    expect(() => full.setFieldValue('probeField', 'hello')).not.toThrow();
    expect(onChangeContextData).toHaveBeenCalled();
  });

  it('reaches the live accessor Proxy on a direct field assignment (contexts.appContext.probeField = ...)', async () => {
    onChangeContextData.mockClear();
    // wire the accessor's own change notifications to the shared mock, and hand DataContextBinder
    // the accessor object itself via getData (as DataContextProvider does with `storage`) - not
    // accessor.getData, which unwraps to the raw plain object and bypasses the accessor's `set` trap.
    const rawAccessor = GetShaContextDataAccessor<IProbeData>(onChangeContextData);
    expect(isShaDataWrapper(rawAccessor)).toBe(true);
    if (!isShaDataWrapper(rawAccessor)) return;
    const accessor = rawAccessor;

    let getFull: ReturnType<typeof useDataContext>['getFull'] | undefined;

    render(
      <DataContextBinder<IProbeData>
        id="appContext"
        name="appContext"
        type="app"
        data={accessor}
        getData={() => accessor}
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
    expect(isFlattenedProbeContext(full)).toBe(true);
    if (!isFlattenedProbeContext(full)) return;

    const callsBeforeWrite = onChangeContextData.mock.calls.length;

    // a form script writing straight through the flattened full context...
    full.probeField = 'direct write';

    // ...must reach the live accessor, not just a snapshot object
    expect(accessor.getData().probeField).toBe('direct write');
    // and it must be the write itself notifying, not some unrelated call (e.g. the mount effect)
    expect(onChangeContextData.mock.calls.length).toBe(callsBeforeWrite + 1);
  });
});
