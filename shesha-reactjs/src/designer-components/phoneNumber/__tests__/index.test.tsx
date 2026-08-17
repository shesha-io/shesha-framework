import PhoneNumberComponent from '../phoneNumber';
import { isValidPhoneValue, normalizeCountryCode } from '../utils';

describe('PhoneNumberComponent', () => {
  test('is registered with the expected type and capabilities', () => {
    expect(PhoneNumberComponent.type).toBe('phoneNumber');
    expect(PhoneNumberComponent.isInput).toBe(true);
    expect(PhoneNumberComponent.isOutput).toBe(true);
  });

  test('initModel applies default settings', () => {
    const model = PhoneNumberComponent.initModel({ id: '1', type: 'phoneNumber', propertyName: 'phone' } as never);

    expect(model.valueFormat).toBe('string');
    expect(model.stripCountryCode).toBe(false);
    expect(model.defaultCountry).toBe('za');
  });

  test('getExtraValidationRules rejects an invalid phone number', async () => {
    const model = PhoneNumberComponent.initModel({ id: '1', type: 'phoneNumber', propertyName: 'phone' } as never);
    const [rule] = PhoneNumberComponent.getExtraValidationRules!(model);
    const validator = (rule as { validator: (rule: unknown, value: unknown) => Promise<void> }).validator;

    await expect(validator(rule, '+2712345')).rejects.toThrow();
    await expect(validator(rule, '+27821234567')).resolves.toBeUndefined();
    await expect(validator(rule, '')).resolves.toBeUndefined();
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
