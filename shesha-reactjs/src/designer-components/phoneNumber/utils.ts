import { CountryCode, getExampleNumber, isSupportedCountry, parsePhoneNumberFromString } from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';
import { IStyleValue } from '@/providers/form/models';
import { IPhoneNumberValue } from './interfaces';

/**
 * Normalizes a country code to the upper-case ISO 3166-1 alpha-2 format expected by
 * libphonenumber-js and antd-phone-input, returning undefined for unsupported/invalid values.
 */
export const normalizeCountryCode = (value?: string): CountryCode | undefined => {
  const normalized = value?.trim().toUpperCase();
  return normalized && isSupportedCountry(normalized) ? normalized : undefined;
};

/**
 * Computes the validation error message for a stored phone-number field value (string or `IPhoneNumberValue`),
 * or `undefined` when the value is empty or a valid, possible number. This is the single source of truth for
 * validation text: it feeds both the Form.Item rule (`getExtraValidationRules`) and the control's own
 * error-state styling, so only one message is ever shown for a given value.
 */
export const getPhoneValidationError = (value: string | IPhoneNumberValue | null | undefined, defaultCountry?: string): string | undefined => {
  const phoneNumberString = typeof value === 'string' ? value : value?.number;
  const trimmed = phoneNumberString?.trim();
  if (!trimmed) return undefined;

  const parsed = parsePhoneNumberFromString(trimmed, normalizeCountryCode(defaultCountry));
  if (!parsed || !parsed.isValid()) return 'Please enter a valid phone number.';
  if (typeof parsed.isPossible === 'function' && !parsed.isPossible()) return 'Phone number length is invalid for the selected country.';
  return undefined;
};

/**
 * Checks whether a stored phone-number field value (string or `IPhoneNumberValue`) parses to a valid,
 * possible number. Empty/undefined values are considered valid (leave `required` to enforce presence).
 */
export const isValidPhoneValue = (value: string | IPhoneNumberValue | null | undefined, defaultCountry?: string): boolean =>
  !getPhoneValidationError(value, defaultCountry);

/**
 * Splits a national phone number into area code and remaining digits, using
 * libphonenumber-js example numbers to estimate the area code length for the given country.
 * Falls back to a heuristic (1/3 of the number length, capped 2-4 digits) when no example
 * number is available or the pattern can't be detected.
 */
export const splitPhoneNumber = (nationalNumber: string, countryCode?: string): { areaCode: string; phoneNumber: string } => {
  if (!nationalNumber) return { areaCode: '', phoneNumber: '' };

  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (normalizedCountryCode) {
    try {
      const exampleNumber = getExampleNumber(normalizedCountryCode, examples);
      if (exampleNumber) {
        const exampleFormatted = exampleNumber.formatNational();
        const areaCodeMatch = exampleFormatted.match(/^[(\s]*(\d+)[)\s]/);
        if (areaCodeMatch?.[1]) {
          const exampleAreaCodeLength = areaCodeMatch[1].length;
          if (exampleAreaCodeLength < nationalNumber.length) {
            return {
              areaCode: nationalNumber.substring(0, exampleAreaCodeLength),
              phoneNumber: nationalNumber.substring(exampleAreaCodeLength),
            };
          }
        }
      }
    } catch (error) {
      console.warn(`Could not get example number for country ${countryCode}:`, error);
    }
  }

  const areaCodeLength = Math.min(4, Math.max(2, Math.floor(nationalNumber.length / 3)));
  return {
    areaCode: nationalNumber.substring(0, areaCodeLength),
    phoneNumber: nationalNumber.substring(areaCodeLength),
  };
};

/** Parses a comma-separated country-code list (or passes an array through) into a clean string array. */
export const parseCountryCodes = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.length > 0 ? value : undefined;
  const parsed = value.split(',').map((code) => code.trim()).filter((code) => code.length > 0);
  return parsed.length > 0 ? parsed : undefined;
};

export const defaultStyles = (): IStyleValue => ({
  background: { type: 'color', color: '#fff' },
  font: {
    weight: '400',
    size: 14,
    color: '#000',
    type: 'Segoe UI',
    align: 'left',
  },
  border: {
    border: {
      all: {
        width: 1,
        style: 'solid',
        color: '#d9d9d9',
      },
    },
    radius: { all: 8 },
    borderType: 'all',
    radiusType: 'all',
  },
  dimensions: {
    width: '100%',
    height: '32px',
    minHeight: '0px',
    maxHeight: 'auto',
    minWidth: '0px',
    maxWidth: 'auto',
  },
  shadow: {
    spreadRadius: 0,
    blurRadius: 0,
    color: '#000',
    offsetX: 0,
    offsetY: 0,
  },
  stylingBoxJson: {
    _type: 'styleBox',
    marginBottom: '0',
    marginLeft: '0',
    marginRight: '0',
    marginTop: '0',
    paddingBottom: '0',
    paddingLeft: '8',
    paddingRight: '8',
    paddingTop: '0',
  },
});
