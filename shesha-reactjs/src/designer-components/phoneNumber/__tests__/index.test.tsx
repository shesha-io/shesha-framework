import { RuleObject } from 'antd/lib/form';
import PhoneNumberComponent from '../phoneNumber';
import { IPhoneNumberComponentProps } from '../interfaces';
import { isValidPhoneValue, normalizeCountryCode } from '../utils';

const buildModel = (overrides: Partial<IPhoneNumberComponentProps> = {}): IPhoneNumberComponentProps => ({
  id: '1',
  type: 'phoneNumber',
  propertyName: 'phone',
  ...overrides,
} as IPhoneNumberComponentProps);

const isCallableRuleObject = (rule: unknown): rule is RuleObject & { validator: (rule: RuleObject, value: unknown) => Promise<void> } =>
  typeof rule === 'object' && rule !== null && typeof (rule as RuleObject).validator === 'function';

const getValidator = (model: IPhoneNumberComponentProps): ((rule: RuleObject, value: unknown) => Promise<void>) => {
  const [rule] = PhoneNumberComponent.getExtraValidationRules!(model);
  if (!isCallableRuleObject(rule)) throw new Error('Expected a rule object with a callable validator');
  return (r, value) => rule.validator(r, value);
};

describe('PhoneNumberComponent', () => {
  test('is registered with the expected type and capabilities', () => {
    expect(PhoneNumberComponent.type).toBe('phoneNumber');
    expect(PhoneNumberComponent.isInput).toBe(true);
    expect(PhoneNumberComponent.isOutput).toBe(true);
  });

  test('initModel applies default settings', () => {
    const model = PhoneNumberComponent.initModel(buildModel());

    expect(model.valueFormat).toBe('string');
    expect(model.stripCountryCode).toBe(false);
    expect(model.defaultCountry).toBe('za');
  });

  test('getExtraValidationRules rejects an invalid phone number', async () => {
    const model = PhoneNumberComponent.initModel(buildModel());
    const validate = getValidator(model);

    await expect(validate({} as RuleObject, '+2712345')).rejects.toThrow();
    await expect(validate({} as RuleObject, '+27821234567')).resolves.toBeUndefined();
    await expect(validate({} as RuleObject, '')).resolves.toBeUndefined();
  });

  test('getExtraValidationRules validates national-format values against a locked country', async () => {
    const model = PhoneNumberComponent.initModel(buildModel({ country: 'gb', valueFormat: 'national' }));
    const validate = getValidator(model);

    // National-format GB number (no country calling code in the stored value).
    await expect(validate({} as RuleObject, '07911123456')).resolves.toBeUndefined();
    await expect(validate({} as RuleObject, '0791112345')).rejects.toThrow();
  });

  // Known limitation: when `country` is not locked (only `defaultCountry` is set), a national-format or
  // stripCountryCode value carries no country info of its own. If a user selects a country other than
  // `defaultCountry` in the widget, this validator still checks the digits against `defaultCountry` and can
  // reject a number that was valid for the selected country. Fixing this fully would require persisting the
  // selected country alongside non-international stored values.
  test('getExtraValidationRules can misvalidate national values for a non-default selected country', async () => {
    const model = PhoneNumberComponent.initModel(buildModel({ defaultCountry: 'za', valueFormat: 'national' }));
    const validate = getValidator(model);

    // A valid GB national number, stored without country context, is checked against `defaultCountry` (za)
    // and incorrectly rejected because no country was selected/persisted for this value.
    await expect(validate({} as RuleObject, '07911123456')).rejects.toThrow();
  });
});

describe('normalizeCountryCode', () => {
  test('normalizes case and whitespace for supported countries', () => {
    expect(normalizeCountryCode(' za ')).toBe('ZA');
    expect(normalizeCountryCode('gb')).toBe('GB');
  });

  test('returns undefined for unsupported or missing values', () => {
    expect(normalizeCountryCode('not-a-country')).toBeUndefined();
    expect(normalizeCountryCode(undefined)).toBeUndefined();
  });
});

describe('isValidPhoneValue', () => {
  test('treats empty values as valid', () => {
    expect(isValidPhoneValue(undefined)).toBe(true);
    expect(isValidPhoneValue('')).toBe(true);
    expect(isValidPhoneValue(null)).toBe(true);
  });

  test('validates a full international number', () => {
    expect(isValidPhoneValue('+27821234567')).toBe(true);
  });

  test('rejects a number that is too short for its country', () => {
    expect(isValidPhoneValue('+2712345')).toBe(false);
  });

  test('validates an object-format value by its number field', () => {
    expect(isValidPhoneValue({ number: '+27821234567', dialCode: '+27', countryCode: 'ZA' })).toBe(true);
  });
});
