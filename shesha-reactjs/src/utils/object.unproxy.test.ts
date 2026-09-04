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

  it('unproxyValue returns a self-referencing proxy instead of recursing', () => {
    let formData: Data = {};
    const nested = (formProxy(() => formData) as { getFieldValue: (n: string) => unknown }).getFieldValue;
    formData = { referenceList: { id: '1' } };
    const proxy = nested('referenceList');
    formData = { referenceList: proxy };
    expect(() => unproxyValue(proxy)).not.toThrow();
  });
});
