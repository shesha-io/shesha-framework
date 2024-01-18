import camelcase from 'camelcase';

/* tslint:disable:no-empty-character-class */

// This code was copied from https://www.npmjs.com/package/decamelize/v/6.0.0 to fix ERR_REQUIRE_ESM
// That was caused by decamelize when this package was used in a project
const handlePreserveConsecutiveUppercase = (decamelized: string, separator: string) => {
  // Lowercase all single uppercase characters. As we
  // want to preserve uppercase sequences, we cannot
  // simply lowercase the separated string at the end.
  // `data_For_USACounties` → `data_for_USACounties`
  const result = decamelized.replace(
    /([\p{Uppercase_Letter}\d])[\p{Uppercase_Letter}\d](?![\p{Uppercase_Letter}\d])/gu,
    ($0) => $0?.toLowerCase()
  );

  // Remaining uppercase sequences will be separated from lowercase sequences.
  // `data_For_USACounties` → `data_for_USA_counties`
  return result.replace(
    /(\p{Uppercase_Letter}+)(\p{Uppercase_Letter}\p{Lowercase_Letter}+)/gu,
    (_, $1, $2) => $1 + separator + $2?.toLowerCase()
  );
};

export function decamelize(text, { separator = '_', preserveConsecutiveUppercase = false } = {}) {
  if (!(typeof text === 'string' && typeof separator === 'string')) {
    throw new TypeError('The `text` and `separator` arguments should be of type `string`');
  }

  // Checking the second character is done later on. Therefore process shorter strings here.
  if (text.length < 2) {
    return preserveConsecutiveUppercase ? text : text?.toLowerCase();
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
    ?.replace(/(\p{Uppercase_Letter})(\p{Uppercase_Letter}\p{Lowercase_Letter}+)/gu, replacement)
    ?.toLowerCase();
}

export function humanizeString(value: string) {
  let localValue = value;

  if (typeof localValue !== 'string') {
    throw new TypeError('Expected a string');
  }

  localValue = decamelize(localValue);
  localValue = localValue
    ?.toLowerCase()
    ?.replace(/[_-]+/g, ' ')
    ?.replace(/\s{2,}/g, ' ')
    ?.trim();
  localValue = localValue.charAt(0).toUpperCase() + localValue.slice(1);

  return localValue;
}

export function isNumeric(value: string) {
  if (typeof value !== 'string') return false; // we only process strings!

  return (
    !isNaN(value as any) && !isNaN(parseFloat(value)) // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
  ); // ...and ensure strings of whitespace fail
}

export function getLastSection(separator: string, value: string) {
  const s = value.split(separator);
  return s.length > 0 ? s[s.length - 1] : '';
}

export const getNumericValue = (localValue: any) => {
  try {
    return Number(localValue);
  } catch (error) {
    return 0;
  }
};
export function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  var separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return uri + separator + key + '=' + value;
  }
}

export function toCamelCase(str: string) {
  return str
    .replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase();
    })
    .replace(/\s/g, '')
    .replace(/^(.)/, function ($1) {
      return $1.toLowerCase();
    });
}

export function getNumberFormat(str: any, format: string) {
  if (str && !isNaN(str)) {
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
export const camelcaseDotNotation = (str) =>
  str
    .split('.')
    .map((s) => camelcase(s))
    .join('.');

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return null;

  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`;
};
