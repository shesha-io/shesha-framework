import { getValidationRules } from '../utils';
import { IConfigurableFormComponent } from '../models';
import { InternalRuleItem } from '@rc-component/async-validator';

const ruleStub = {} as InternalRuleItem;

const runRule = (validator: string, value: unknown): Promise<void> => {
  const component = { id: 'c1', type: 'textField', propertyName: 'name', validate: { validator } } as IConfigurableFormComponent;
  const rules = getValidationRules(component, { formData: { name: value } });
  const rule = rules.find((r) => typeof r.asyncValidator === 'function');
  if (!rule?.asyncValidator) throw new Error('no asyncValidator rule was built');
  return rule.asyncValidator(ruleStub, value, () => {}, {}, {}) as Promise<void>;
};

// Guards against the validator never settling, which is exactly the hang from #5073.
const settlesWithin = (p: Promise<void>, ms = 200): Promise<'resolved' | string> => {
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('validator never settled')), ms));
  return Promise.race([p, timeout]).then(() => 'resolved' as const, (e: unknown) => String(e));
};

describe('custom validator rule (#5073)', () => {
  const callbackOnlyOnFailure = "if (value?.indexOf('A') === -1) callback('Not correct!');";

  it('rejects when a callback-style script reports an error', async () => {
    await expect(settlesWithin(runRule(callbackOnlyOnFailure, 'xyz'))).resolves.toBe('Not correct!');
  });

  it('resolves when a callback-style script returns without calling back', async () => {
    await expect(settlesWithin(runRule(callbackOnlyOnFailure, 'ABC'))).resolves.toBe('resolved');
  });

  it('honours an explicit success callback', async () => {
    await expect(settlesWithin(runRule('callback();', 'anything'))).resolves.toBe('resolved');
  });

  it('uses a returned promise', async () => {
    await expect(settlesWithin(runRule("return value === 'ok' ? Promise.resolve() : Promise.reject('Bad value');", 'ok'))).resolves.toBe('resolved');
    await expect(settlesWithin(runRule("return value === 'ok' ? Promise.resolve() : Promise.reject('Bad value');", 'no'))).resolves.toBe('Bad value');
  });

  it('turns a thrown error into a validation message instead of an unhandled exception', async () => {
    await expect(settlesWithin(runRule("throw new Error('boom');", 'x'))).resolves.toBe('boom');
  });

  it('passes form data to the script', async () => {
    await expect(settlesWithin(runRule("if (data.name !== value) callback('mismatch');", 'same'))).resolves.toBe('resolved');
  });
});
