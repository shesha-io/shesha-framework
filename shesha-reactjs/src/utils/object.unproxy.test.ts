import moment from 'moment';
import { GetShaFormDataAccessor } from '@/providers/dataContextProvider/contexts/shaDataAccessProxy';
import { IFormApi } from '@/providers/form/formApi';
import { hasFiles } from './form';
import { deepMergeValues, isProxy, unproxyDeep, unproxyValue } from './object';

type Data = Record<string, unknown>;

const formProxy = (getData: () => Data): Data => {
  const api = { getFormData: getData, setFieldsValue: () => undefined, setFieldValue: () => undefined } as unknown as IFormApi<Data>;
  return GetShaFormDataAccessor(api) as unknown as Data;
};

type FieldGetter = { getFieldValue: (name: string) => unknown };
// `in` is answered by the proxy's `has` trap for the form data, so read the accessor member instead
const hasGetFieldValue = (value: unknown): value is FieldGetter =>
  typeof value === 'object' && value !== null && typeof Reflect.get(value, 'getFieldValue') === 'function';
const fieldGetter = (getData: () => Data): FieldGetter['getFieldValue'] => {
  const proxy = formProxy(getData);
  if (!hasGetFieldValue(proxy)) throw new Error('form proxy has no getFieldValue');
  return proxy.getFieldValue;
};

describe('unproxyDeep', () => {
  it('replaces nested data-access proxies produced by spreading form.data', () => {
    const formData: Data = { item: 'a', referenceList: { id: '1', _displayName: 'RL' }, tags: [{ id: 't1' }] };
    const spread = { description: '', ...formProxy(() => formData) };
    expect(isProxy(spread.referenceList)).toBe(true);

    const plain = unproxyDeep(spread);
    expect(isProxy(plain.referenceList)).toBe(false);
    expect(plain).toEqual({ description: '', item: 'a', referenceList: { id: '1', _displayName: 'RL' }, tags: [{ id: 't1' }] });
  });

  it('keeps the same reference when nothing is a proxy', () => {
    const value = { a: 1, nested: { b: [1, 2] }, when: moment('2026-01-01'), date: new Date(0) };
    expect(unproxyDeep(value)).toBe(value);
  });

  it('stops the merge from storing a proxy that would later loop forever', () => {
    let formData: Data = { item: 'a', referenceList: { id: '1' } };
    const spread = { ...formProxy(() => formData) };

    const corrupted = deepMergeValues({ item: 'b' }, spread);
    formData = corrupted;
    expect(isProxy(corrupted.referenceList)).toBe(true);
    expect(() => hasFiles(corrupted)).toThrow(RangeError);

    formData = { item: 'a', referenceList: { id: '1' } };
    const safe = deepMergeValues({ item: 'b' }, unproxyDeep({ ...formProxy(() => formData) }));
    formData = safe;
    expect(isProxy(safe.referenceList)).toBe(false);
    expect(hasFiles(safe)).toBe(false);
  });

  it('gives shared references the same proxy-free copy', () => {
    const formData: Data = { referenceList: { id: '1' } };
    const shared = { nested: formProxy(() => formData).referenceList };
    const plain = unproxyDeep({ first: shared, second: shared });
    expect(isProxy(plain.first.nested)).toBe(false);
    expect(isProxy(plain.second.nested)).toBe(false);
    expect(plain.first).toBe(plain.second);
  });

  it('unproxyValue stops on two proxies that resolve to each other', () => {
    let formData: Data = {};
    const getField = fieldGetter(() => formData);
    formData = { a: { id: 'a' }, b: { id: 'b' } };
    const proxyA = getField('a');
    const proxyB = getField('b');
    formData = { a: proxyB, b: proxyA };
    expect(() => unproxyValue(proxyA)).not.toThrow();
    expect(() => unproxyDeep({ a: proxyA })).not.toThrow();
  });

  it('unproxyValue returns a self-referencing proxy instead of recursing', () => {
    let formData: Data = {};
    const nested = fieldGetter(() => formData);
    formData = { referenceList: { id: '1' } };
    const proxy = nested('referenceList');
    formData = { referenceList: proxy };
    expect(() => unproxyValue(proxy)).not.toThrow();
  });
});
