import moment, { isMoment, Moment } from 'moment';
import { getSafelyTrimmedString } from './index';
import { RangeValue } from '@/designer-components/dateField/interfaces';

/**
 * Checks if the date provided is within the date range
 *
 * @param {string} dateFrom - the minimum date
 * @param {string} dateTo - the maximum date
 * @param {string} dateToCompare - the date to compare
 */
export const isDateBetween = (dateFrom: string, dateTo: string, dateToCompare: string): boolean => {
  if (!getSafelyTrimmedString(dateFrom) || !getSafelyTrimmedString(dateTo) || !getSafelyTrimmedString(dateToCompare))
    return false;
  let lDate = new Date();
  lDate = new Date();
  lDate.setDate(lDate.getDate() + 7); // lastdate

  if (Date.parse(dateToCompare) <= Date.parse(dateTo) && Date.parse(dateToCompare) >= Date.parse(dateFrom)) {
    return true;
  }

  return false;
};

/**
 *
 * @param dateString
 */
export const getFormattedDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.toDateString()} ${date.toLocaleTimeString()}`;
};

/**
 * Convert date from ISO format to `YYYY/MM/DD HH:mm:ss`
 *
 * @param date - date in `YYYY/MM/DD HH:mm:ss` format
 * @returns date in `YYYY/MM/DD HH:mm:ss` or an empty string if the date passed was in the wrong format
 */
export const formattedDate = (date: string): string => {
  try {
    const dateValue = new Date(date);

    return moment(dateValue).format('YYYY/MM/DD HH:mm');
  } catch {
    return '';
  }
};

export const shortDob = (date: string): string => {
  try {
    const dateValue = new Date(date);

    return moment(dateValue).format('YYYY/MM/DD');
  } catch {
    return '';
  }
};

export const LongDob = (date: string): string => {
  try {
    const dateValue = new Date(date);

    return moment(dateValue).format('DD MMM YYYY');
  } catch {
    return '';
  }
};

export const tolocalIsoDate = (dateIsoString: string): string => {
  const tzoffset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(Date.parse(dateIsoString) - tzoffset).toISOString().slice(0, -1);
};

export const getMoment = (value: unknown, dateFormat: string): Moment => {
  if (value === null || value === undefined) return undefined;

  const values = [isMoment(value) ? value : null, moment(value as string), moment(value as string, dateFormat)];
  const parsed = values.find((i) => isMoment(i) && i.isValid());
  return parsed;
};

export const getRangeMoment = (value: unknown, dateFormat: string): RangeValue =>
  (Array.isArray(value) && value?.length === 2
    ? value?.map((v) => getMoment(v, dateFormat))
    : [null, null]) as RangeValue;
