import { CountryCode, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { IStyleValue } from '@/providers/form/models';

/**
 * Splits a national phone number into area code and remaining digits, using
 * libphonenumber-js example numbers to estimate the area code length for the given country.
 * Falls back to a heuristic (1/3 of the number length, capped 2-4 digits) when no example
 * number is available or the pattern can't be detected.
 */
export const splitPhoneNumber = (nationalNumber: string, countryCode?: string): { areaCode: string; phoneNumber: string } => {
  if (!nationalNumber) return { areaCode: '', phoneNumber: '' };

  if (countryCode) {
    try {
      const exampleNumber = getExampleNumber(countryCode.toUpperCase() as CountryCode, examples);
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
