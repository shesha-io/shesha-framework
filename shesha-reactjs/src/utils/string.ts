import { isNullOrWhiteSpace } from '@/utils/nullables';
import camelcase from 'camelcase';

/* tslint:disable:no-empty-character-class */

// This code was copied from https://www.npmjs.com/package/decamelize/v/6.0.0 to fix ERR_REQUIRE_ESM
// That was caused by decamelize when this package was used in a project
const handlePreserveConsecutiveUppercase = (decamelized: string, separator: string): string => {
  // Lowercase all single uppercase characters. As we
  // want to preserve uppercase sequences, we cannot
  // simply lowercase the separated string at the end.
  // `data_For_USACounties` → `data_for_USACounties`
  const result = decamelized.replace(
    /([\p{Uppercase_Letter}\d])[\p{Uppercase_Letter}\d](?![\p{Uppercase_Letter}\d])/gu,
    ($0) => $0.toLowerCase(),
  );

  // Remaining uppercase sequences will be separated from lowercase sequences.
  // `data_For_USACounties` → `data_for_USA_counties`
  return result.replace(
    /(\p{Uppercase_Letter}+)(\p{Uppercase_Letter}\p{Lowercase_Letter}+)/gu,
    (_, $1, $2: string) => $1 + separator + (!isNullOrWhiteSpace($2) ? $2.toLowerCase() : ""),
  );
};

type DecamelizeOptions = { separator: string; preserveConsecutiveUppercase: boolean };
const DEFAULT_DECAMELIZE_OPTIONS: DecamelizeOptions = { separator: '_', preserveConsecutiveUppercase: false };
export function decamelize(text: string, options?: DecamelizeOptions): string {
  const { separator, preserveConsecutiveUppercase } = options ?? DEFAULT_DECAMELIZE_OPTIONS;
  if (isNullOrWhiteSpace(text))
    return text;

  // Checking the second character is done later on. Therefore process shorter strings here.
  if (text.length < 2) {
    return preserveConsecutiveUppercase ? text : text.toLowerCase();
  }

  const replacement = `$1${separator}$2`;

  // Split lowercase sequences followed by uppercase character.
  // `dataForUSACounties` → `data_For_USACounties`
  // `myURLstring → `my_URLstring`
  const decamelized = text.replace(/([\p{Lowercase_Letter}\d])(\p{Uppercase_Letter})/gu, replacement);

  if (preserveConsecutiveUppercase) {
    return handlePreserveConsecutiveUppercase(decamelized, separator);
  }

  // Split multiple uppercase characters followed by one or more lowercase characters.
  // `my_URLstring` → `my_ur_lstring`
  return decamelized
    .replace(/(\p{Uppercase_Letter})(\p{Uppercase_Letter}\p{Lowercase_Letter}+)/gu, replacement)
    .toLowerCase();
}

export function humanizeString(value: string): string {
  if (isNullOrWhiteSpace(value))
    return value;

  let localValue = value;

  if (typeof localValue !== 'string') {
    throw new TypeError('Expected a string');
  }

  localValue = decamelize(localValue);
  localValue = localValue
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  localValue = localValue.charAt(0).toUpperCase() + localValue.slice(1);

  return localValue;
}

export function isNumeric(value: string): boolean {
  return typeof value === 'string' && !isNullOrWhiteSpace(value) && !isNaN(parseFloat(value));
}

export function getLastSection(separator: string, value: string): string {
  const s = value.split(separator);
  return s.length > 0
    ? s[s.length - 1] ?? ""
    : '';
}

export const getNumericValue = (localValue: number | string): number => {
  try {
    return Number(localValue);
  } catch {
    return 0;
  }
};

export function toCamelCase(str: string): string {
  return str
    .replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase();
    })
    .replace(/\s/g, '')
    .replace(/^(.)/, function ($1) {
      return $1.toLowerCase();
    });
}

export function getNumberFormat(str: string, format: string): string {
  if (!isNullOrWhiteSpace(str)) {
    const value = parseFloat(str);

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-ZA', {
          style: 'currency',
          currency: 'ZAR',
        }).format(value);

      case 'round':
        return value.toFixed();

      case 'thousandSeparator':
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      default:
        return str;
    }
  }

  return str;
}

/* Convert string to camelCase */
export const camelcaseDotNotation = (str: string): string =>
  str
    .split('.')
    .map((s) => camelcase(s))
    .join('.');

export const capitalizeFirstLetter = (str: string): string => {
  if (isNullOrWhiteSpace(str))
    return str;
  return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
};


export const verifiedCamelCase = (value: string): string => {
  return camelcase(value);
};

/**
 * Trims the specified suffix from the given string.
 *
 * @param {string} s - the input string
 * @param {string} w - the suffix to be trimmed
 * @return {string} the modified string with the suffix trimmed
 */
export const trimSuffix = (s: string, w: string): string => {
  return s && s.endsWith(w)
    ? s.slice(0, -w.length)
    : s;
};

/**
 * Removes the specified prefix from the given string if it exists.
 *
 * @param {string} s - The string to remove the prefix from.
 * @param {string} w - The prefix to remove.
 * @return {string} The modified string after removing the prefix.
 */
export const trimPrefix = (s: string, w: string): string => {
  return s && s.startsWith(w)
    ? s.slice(w.length)
    : s;
};

export const isEmptyString = (value: unknown): boolean => {
  return typeof (value) === 'string' && value.trim() === '';
};
