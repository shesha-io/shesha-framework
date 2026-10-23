import moment, { isMoment, Moment } from 'moment';
import { RangeValue } from '@/designer-components/dateField/interfaces';

export const tolocalIsoDate = (dateIsoString: string): string => {
  const tzoffset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(Date.parse(dateIsoString) - tzoffset).toISOString().slice(0, -1);
};

export const getMoment = (value: unknown, dateFormat: string): Moment | undefined => {
  if (value === null || value === undefined) return undefined;

  const values = [isMoment(value) ? value : undefined, moment(value as string), moment(value as string, dateFormat)];
  const parsed = values.find((i) => isMoment(i) && i.isValid());
  return parsed;
};

export const getRangeMoment = (value: unknown, dateFormat: string): RangeValue =>
  (Array.isArray(value) && value.length === 2
    ? value.map((v) => getMoment(v, dateFormat))
    : [null, null]) as RangeValue;
