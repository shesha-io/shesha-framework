import { deepMergeValues } from './object';

/** Refs #4603: reverting a JS setting without a script used to keep `_mode: 'code'` underneath the plain value. */
describe('deepMergeValues with JS-enabled settings', () => {
  const pickedForm = { module: 'Boxfusion.SheshaFunctionalTests.Web', name: 'details' };

  it('replaces a JS-mode wrapper with the plain value handed back on revert', () => {
    const before = { formId: { _mode: 'code', _code: undefined, _value: pickedForm } };
    const after = deepMergeValues(before, { formId: pickedForm });
    expect(after.formId).toEqual(pickedForm);
    expect(after.formId).not.toHaveProperty('_mode');
  });

  it('replaces a plain value with a JS-mode wrapper when switching to JS', () => {
    const before = { formId: pickedForm };
    const after = deepMergeValues(before, { formId: { _mode: 'code', _value: pickedForm } });
    expect(after.formId).toEqual({ _mode: 'code', _value: pickedForm });
  });

  it('replaces one wrapper with another instead of merging their keys', () => {
    const before = { label: { _mode: 'code', _code: 'return "a";', _value: 'A' } };
    const after = deepMergeValues(before, { label: { _mode: 'value', _value: 'B' } });
    expect(after.label).toEqual({ _mode: 'value', _value: 'B' });
  });

  it('still merges ordinary nested objects and untouched siblings', () => {
    const before = { formId: { _mode: 'code', _value: pickedForm }, font: { size: 12, weight: 400 } };
    const after = deepMergeValues(before, { font: { size: 14 } });
    expect(after.font).toEqual({ size: 14, weight: 400 });
    expect(after.formId).toEqual({ _mode: 'code', _value: pickedForm });
  });
});
