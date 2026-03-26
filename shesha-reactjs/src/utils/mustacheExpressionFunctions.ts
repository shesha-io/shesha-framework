export type MustacheFunctionCategory = 'String' | 'Date' | 'Number' | 'Logic';

export interface MustacheFunctionArg {
  name: string;
  description: string;
  optional?: boolean;
}

export interface MustacheFunctionDefinition {
  name: string;
  description: string;
  category: MustacheFunctionCategory;
  args: MustacheFunctionArg[];
  evaluate: (...args: unknown[]) => unknown;
}

function toStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function toNum(value: unknown): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) throw new Error(`Cannot convert "${value}" to number`);
  return parsed;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  const date = new Date(toStr(value));
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: "${value}"`);
  return date;
}

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0 && value.toLowerCase() !== 'false';
  return Boolean(value);
}

function formatRelative(date: Date, reference: Date): string {
  const diffMs = reference.getTime() - date.getTime();
  const absDiffMs = Math.abs(diffMs);
  const isFuture = diffMs < 0;
  const prefix = isFuture ? 'in ' : '';
  const suffix = isFuture ? '' : ' ago';

  const seconds = Math.floor(absDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${prefix}${seconds} seconds${suffix}`;
  if (minutes === 1) return `${prefix}1 minute${suffix}`;
  if (minutes < 60) return `${prefix}${minutes} minutes${suffix}`;
  if (hours === 1) return `${prefix}1 hour${suffix}`;
  if (hours < 24) return `${prefix}${hours} hours${suffix}`;
  if (days === 1) return isFuture ? 'tomorrow' : 'yesterday';
  if (days < 7) return `${prefix}${days} days${suffix}`;
  if (weeks === 1) return `${prefix}1 week${suffix}`;
  if (weeks < 5) return `${prefix}${weeks} weeks${suffix}`;
  if (months === 1) return `${prefix}1 month${suffix}`;
  if (months < 12) return `${prefix}${months} months${suffix}`;
  if (years === 1) return `${prefix}1 year${suffix}`;
  return `${prefix}${years} years${suffix}`;
}

const registry = new Map<string, MustacheFunctionDefinition>();

const register = (definition: MustacheFunctionDefinition): void => {
  registry.set(definition.name, definition);
};

register({
  name: 'UPPER',
  description: 'Converts text to uppercase',
  category: 'String',
  args: [{ name: 'text', description: 'The text to convert' }],
  evaluate: (text) => toStr(text).toUpperCase(),
});

register({
  name: 'LOWER',
  description: 'Converts text to lowercase',
  category: 'String',
  args: [{ name: 'text', description: 'The text to convert' }],
  evaluate: (text) => toStr(text).toLowerCase(),
});

register({
  name: 'TRIM',
  description: 'Removes leading and trailing whitespace',
  category: 'String',
  args: [{ name: 'text', description: 'The text to trim' }],
  evaluate: (text) => toStr(text).trim(),
});

register({
  name: 'LEN',
  description: 'Returns the length of text',
  category: 'String',
  args: [{ name: 'text', description: 'The text to measure' }],
  evaluate: (text) => toStr(text).length,
});

register({
  name: 'CONCAT',
  description: 'Concatenates multiple text values',
  category: 'String',
  args: [
    { name: 'text1', description: 'First text' },
    { name: 'text2', description: 'Second text' },
    { name: '...more', description: 'Additional text values', optional: true },
  ],
  evaluate: (...args) => args.map(toStr).join(''),
});

register({
  name: 'LEFT',
  description: 'Returns the first n characters of text',
  category: 'String',
  args: [
    { name: 'text', description: 'The source text' },
    { name: 'count', description: 'Number of characters' },
  ],
  evaluate: (text, count) => toStr(text).slice(0, toNum(count)),
});

register({
  name: 'RIGHT',
  description: 'Returns the last n characters of text',
  category: 'String',
  args: [
    { name: 'text', description: 'The source text' },
    { name: 'count', description: 'Number of characters' },
  ],
  evaluate: (text, count) => {
    const str = toStr(text);
    return str.slice(Math.max(0, str.length - toNum(count)));
  },
});

register({
  name: 'MID',
  description: 'Returns a substring starting at position for length characters (1-based)',
  category: 'String',
  args: [
    { name: 'text', description: 'The source text' },
    { name: 'start', description: 'Start position (1-based)' },
    { name: 'length', description: 'Number of characters' },
  ],
  evaluate: (text, start, length) => {
    const str = toStr(text);
    const startIndex = toNum(start) - 1;
    return str.slice(startIndex, startIndex + toNum(length));
  },
});

register({
  name: 'REPLACE',
  description: 'Replaces the first occurrence of old text with new text',
  category: 'String',
  args: [
    { name: 'text', description: 'The source text' },
    { name: 'oldText', description: 'Text to find' },
    { name: 'newText', description: 'Replacement text' },
  ],
  evaluate: (text, oldText, newText) => toStr(text).replace(toStr(oldText), toStr(newText)),
});

register({
  name: 'FIND',
  description: 'Returns the position of search text (1-based), or 0 if not found',
  category: 'String',
  args: [
    { name: 'search', description: 'Text to search for' },
    { name: 'text', description: 'Text to search in' },
  ],
  evaluate: (search, text) => {
    const index = toStr(text).indexOf(toStr(search));
    return index === -1 ? 0 : index + 1;
  },
});

register({
  name: 'SUBSTITUTE',
  description: 'Replaces all occurrences of old text with new text',
  category: 'String',
  args: [
    { name: 'text', description: 'The source text' },
    { name: 'oldText', description: 'Text to find' },
    { name: 'newText', description: 'Replacement text' },
  ],
  evaluate: (text, oldText, newText) => toStr(text).split(toStr(oldText)).join(toStr(newText)),
});

register({
  name: 'NOW',
  description: 'Returns the current date and time as an ISO string',
  category: 'Date',
  args: [],
  evaluate: () => new Date().toISOString(),
});

register({
  name: 'TODAY',
  description: 'Returns the current date (YYYY-MM-DD)',
  category: 'Date',
  args: [],
  evaluate: () => new Date().toISOString().slice(0, 10),
});

register({
  name: 'DATEFORMAT',
  description: 'Formats a date using tokens: YYYY, MM, DD, HH, mm, ss',
  category: 'Date',
  args: [
    { name: 'date', description: 'The date to format' },
    { name: 'format', description: 'Format string (e.g. "YYYY-MM-DD")' },
  ],
  evaluate: (date, format) => {
    const parsedDate = toDate(date);
    const tokens: Record<string, string> = {
      YYYY: String(parsedDate.getFullYear()),
      MM: String(parsedDate.getMonth() + 1).padStart(2, '0'),
      DD: String(parsedDate.getDate()).padStart(2, '0'),
      HH: String(parsedDate.getHours()).padStart(2, '0'),
      mm: String(parsedDate.getMinutes()).padStart(2, '0'),
      ss: String(parsedDate.getSeconds()).padStart(2, '0'),
    };

    let output = toStr(format);
    Object.entries(tokens).forEach(([token, tokenValue]) => {
      output = output.replace(new RegExp(token, 'g'), tokenValue);
    });

    return output;
  },
});

register({
  name: 'DATEADD',
  description: 'Adds a number of units to a date. Units: days, months, years',
  category: 'Date',
  args: [
    { name: 'date', description: 'The base date' },
    { name: 'amount', description: 'Number of units to add' },
    { name: 'unit', description: '"days", "months", or "years"' },
  ],
  evaluate: (date, amount, unit) => {
    const parsedDate = toDate(date);
    const result = new Date(parsedDate);
    const numericAmount = toNum(amount);
    const normalizedUnit = toStr(unit).toLowerCase();

    if (normalizedUnit === 'days') result.setDate(result.getDate() + numericAmount);
    else if (normalizedUnit === 'months') result.setMonth(result.getMonth() + numericAmount);
    else if (normalizedUnit === 'years') result.setFullYear(result.getFullYear() + numericAmount);
    else throw new Error(`Unknown unit: "${normalizedUnit}"`);

    return result.toISOString().slice(0, 10);
  },
});

register({
  name: 'DATEDIFF',
  description: 'Returns the difference between two dates in the specified unit',
  category: 'Date',
  args: [
    { name: 'date1', description: 'First date' },
    { name: 'date2', description: 'Second date' },
    { name: 'unit', description: '"days", "months", or "years"' },
  ],
  evaluate: (date1, date2, unit) => {
    const parsedDate1 = toDate(date1);
    const parsedDate2 = toDate(date2);
    const normalizedUnit = toStr(unit).toLowerCase();
    const diffMs = parsedDate2.getTime() - parsedDate1.getTime();

    if (normalizedUnit === 'days') return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (normalizedUnit === 'months') {
      return (parsedDate2.getFullYear() - parsedDate1.getFullYear()) * 12 + (parsedDate2.getMonth() - parsedDate1.getMonth());
    }
    if (normalizedUnit === 'years') return parsedDate2.getFullYear() - parsedDate1.getFullYear();

    throw new Error(`Unknown unit: "${normalizedUnit}"`);
  },
});

register({
  name: 'YEAR',
  description: 'Extracts the year from a date',
  category: 'Date',
  args: [{ name: 'date', description: 'The date' }],
  evaluate: (date) => toDate(date).getFullYear(),
});

register({
  name: 'MONTH',
  description: 'Extracts the month (1-12) from a date',
  category: 'Date',
  args: [{ name: 'date', description: 'The date' }],
  evaluate: (date) => toDate(date).getMonth() + 1,
});

register({
  name: 'DAY',
  description: 'Extracts the day of the month from a date',
  category: 'Date',
  args: [{ name: 'date', description: 'The date' }],
  evaluate: (date) => toDate(date).getDate(),
});

register({
  name: 'TIMEAGO',
  description: 'Returns a relative string compared with now',
  category: 'Date',
  args: [{ name: 'date', description: 'The date to describe relative to now' }],
  evaluate: (date) => formatRelative(toDate(date), new Date()),
});

register({
  name: 'RELATIVEDATE',
  description: 'Returns a relative time string between two dates',
  category: 'Date',
  args: [
    { name: 'date', description: 'The date to describe' },
    { name: 'reference', description: 'Reference date (defaults to now)', optional: true },
  ],
  evaluate: (date, reference) => {
    const parsedReference = reference !== undefined ? toDate(reference) : new Date();
    return formatRelative(toDate(date), parsedReference);
  },
});

register({
  name: 'ROUND',
  description: 'Rounds a number to decimal places',
  category: 'Number',
  args: [
    { name: 'number', description: 'The number to round' },
    { name: 'decimals', description: 'Decimal places (default 0)', optional: true },
  ],
  evaluate: (number, decimals) => {
    const decimalPlaces = decimals !== undefined ? toNum(decimals) : 0;
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(toNum(number) * factor) / factor;
  },
});

register({
  name: 'FLOOR',
  description: 'Rounds a number down to the nearest integer',
  category: 'Number',
  args: [{ name: 'number', description: 'The number to round down' }],
  evaluate: (number) => Math.floor(toNum(number)),
});

register({
  name: 'CEIL',
  description: 'Rounds a number up to the nearest integer',
  category: 'Number',
  args: [{ name: 'number', description: 'The number to round up' }],
  evaluate: (number) => Math.ceil(toNum(number)),
});

register({
  name: 'ABS',
  description: 'Returns the absolute value of a number',
  category: 'Number',
  args: [{ name: 'number', description: 'The number' }],
  evaluate: (number) => Math.abs(toNum(number)),
});

register({
  name: 'MIN',
  description: 'Returns the smallest of the given numbers',
  category: 'Number',
  args: [
    { name: 'number1', description: 'First number' },
    { name: 'number2', description: 'Second number' },
    { name: '...more', description: 'Additional numbers', optional: true },
  ],
  evaluate: (...args) => Math.min(...args.map(toNum)),
});

register({
  name: 'MAX',
  description: 'Returns the largest of the given numbers',
  category: 'Number',
  args: [
    { name: 'number1', description: 'First number' },
    { name: 'number2', description: 'Second number' },
    { name: '...more', description: 'Additional numbers', optional: true },
  ],
  evaluate: (...args) => Math.max(...args.map(toNum)),
});

register({
  name: 'SUM',
  description: 'Returns the sum of the given numbers',
  category: 'Number',
  args: [
    { name: 'number1', description: 'First number' },
    { name: 'number2', description: 'Second number' },
    { name: '...more', description: 'Additional numbers', optional: true },
  ],
  evaluate: (...args) => args.reduce<number>((sum, value) => sum + toNum(value), 0),
});

register({
  name: 'AVG',
  description: 'Returns the average of the given numbers',
  category: 'Number',
  args: [
    { name: 'number1', description: 'First number' },
    { name: 'number2', description: 'Second number' },
    { name: '...more', description: 'Additional numbers', optional: true },
  ],
  evaluate: (...args) => {
    if (args.length === 0) return 0;
    return args.reduce<number>((sum, value) => sum + toNum(value), 0) / args.length;
  },
});

register({
  name: 'IF',
  description: 'Returns thenValue if condition is true, otherwise elseValue',
  category: 'Logic',
  args: [
    { name: 'condition', description: 'The condition to test' },
    { name: 'thenValue', description: 'Value if true' },
    { name: 'elseValue', description: 'Value if false' },
  ],
  evaluate: (condition, thenValue, elseValue) => (toBool(condition) ? thenValue : elseValue),
});

register({
  name: 'AND',
  description: 'Returns true if all arguments are true',
  category: 'Logic',
  args: [
    { name: 'value1', description: 'First value' },
    { name: 'value2', description: 'Second value' },
    { name: '...more', description: 'Additional values', optional: true },
  ],
  evaluate: (...args) => args.every((arg) => toBool(arg)),
});

register({
  name: 'OR',
  description: 'Returns true if any argument is true',
  category: 'Logic',
  args: [
    { name: 'value1', description: 'First value' },
    { name: 'value2', description: 'Second value' },
    { name: '...more', description: 'Additional values', optional: true },
  ],
  evaluate: (...args) => args.some((arg) => toBool(arg)),
});

register({
  name: 'NOT',
  description: 'Returns the logical negation of a value',
  category: 'Logic',
  args: [{ name: 'value', description: 'The value to negate' }],
  evaluate: (value) => !toBool(value),
});

register({
  name: 'RELATIVE_DATETIME',
  description: 'Alias of RELATIVEDATE for backward compatibility',
  category: 'Date',
  args: [
    { name: 'date', description: 'The date to describe' },
    { name: 'reference', description: 'Reference date (defaults to now)', optional: true },
  ],
  evaluate: (date, reference) => {
    const parsedReference = reference !== undefined ? toDate(reference) : new Date();
    return formatRelative(toDate(date), parsedReference);
  },
});

const functionDefinitions = Array.from(registry.values());
const runtimeScope = functionDefinitions.reduce<Record<string, (...args: unknown[]) => unknown>>((acc, definition) => {
  acc[definition.name] = (...args: unknown[]) => definition.evaluate(...args);
  return acc;
}, {});

export const getMustacheFunctionDefinitions = (): MustacheFunctionDefinition[] => functionDefinitions;

export const getMustacheRuntimeScope = (): Record<string, (...args: unknown[]) => unknown> => runtimeScope;
