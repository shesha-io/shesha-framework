import moment, { Moment } from 'moment';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { getDataProperty } from '@/utils/metadata';
import { getMoment } from '@/utils/date';
import { DisabledDateTemplate, IDateFieldProps } from './interfaces';
import { range } from 'lodash';
import { IStyleType } from '@/index';

export const DATE_TIME_FORMATS = {
  time: 'HH:mm:ss',
  week: 'YYYY-wo',
  date: 'DD/MM/YYYY',
  quarter: 'YYYY-\\QQ',
  month: 'YYYY-MM',
  year: 'YYYY',
};

export const getDatePickerValue = (props: IDateFieldProps, pickerFormat: string) => {
  const { value, injectedDefaultValue } = props;

  /** Used to changed value/defaultValue based on whether it's rendered on the table **/
  if (injectedDefaultValue) {
    return { defaultValue: getMoment(value, pickerFormat) };
  }

  /** Used to handle the value based on default date-picker implementation **/
  return { value: getMoment(value, pickerFormat) };
};

export function disabledDate(props: IDateFieldProps, current: Moment, data: object, globalState: object) {
  const { disabledDateMode, disabledDateTemplate, disabledDateFunc } = props;

  if (disabledDateMode === 'none') return false;

  const disabledTimeExpression = disabledDateMode === 'functionTemplate' ? disabledDateTemplate : disabledDateFunc;

  // tslint:disable-next-line:function-constructor
  const disabledFunc = new Function('current', 'moment', 'data', 'globalState', disabledTimeExpression);

  return disabledFunc(current, moment, data, globalState);
}

export const getDefaultFormat = ({ showTime, resolveToUTC }: IDateFieldProps) => {
  if (!showTime) {
    return 'YYYY-MM-DD';
  }

  if (!resolveToUTC) {
    return 'YYYY-MM-DDTHH:mm:ss';
  }

  return null;
};

export const timeObject = () => {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
};

const disabledTimeTemplateFunc = (disabledTimeTemplate: DisabledDateTemplate) => {
  if (disabledTimeTemplate === 'disabledPastTime') {
    return () => ({
      disabledHours: () => range(0, timeObject().hours),
      disabledMinutes: () => range(0, timeObject().minutes),
      disabledSeconds: () => range(0, timeObject().seconds),
    });
  }

  return () => ({
    disabledHours: () => range(timeObject().hours + 1, 24),
    disabledMinutes: () => range(timeObject().minutes + 1, 60),
    disabledSeconds: () => range(timeObject().seconds + 1, 60),
  });
};

export const disabledTime = (props: IDateFieldProps, data: object, globalState: object) => {
  const { disabledTimeMode, disabledTimeTemplate, disabledTimeFunc } = props;

  if (disabledTimeMode === 'none') return undefined;

  const disabledTimeExpressionFunc =
    disabledTimeMode === 'timeFunctionTemplate' ? disabledTimeTemplateFunc(disabledTimeTemplate) : disabledTimeFunc;

  if (typeof disabledTimeExpressionFunc === 'string') {
    // tslint:disable-next-line:function-constructor
    const disabledFunc = new Function('moment', 'data', 'globalState', 'range', disabledTimeExpressionFunc);

    return disabledFunc(moment, data, globalState, range);
  }

  return disabledTimeExpressionFunc;
};

export const getFormat = (props: IDateFieldProps, properties: IPropertyMetadata[]) => {
  const { propertyName, picker, showTime } = props || {};

  const dateFormat = props?.dateFormat || getDataProperty(properties, propertyName) || DATE_TIME_FORMATS.date;
  const timeFormat = props?.timeFormat || DATE_TIME_FORMATS.time;
  const yearFormat = props?.yearFormat || DATE_TIME_FORMATS.year;
  const quarterFormat = props?.quarterFormat || DATE_TIME_FORMATS.quarter;
  const monthFormat = props?.monthFormat || DATE_TIME_FORMATS.month;
  const weekFormat = props?.weekFormat || DATE_TIME_FORMATS.week;

  switch (picker) {
    case 'date':
      return showTime ? `${dateFormat} ${timeFormat}` : dateFormat;
    case 'year':
      return yearFormat;
    case 'month':
      return monthFormat;
    case 'quarter':
      return quarterFormat;
    case 'time':
      return timeFormat;
    case 'week':
      return weekFormat;
    default:
      return dateFormat;
  }
};

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#fff' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
    border: {
      border: {
        all: { width: '1px', style: 'solid', color: '#d9d9d9' },
        top: { width: '1px', style: 'solid', color: '#d9d9d9' },
        bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
        left: { width: '1px', style: 'solid', color: '#d9d9d9' },
        right: { width: '1px', style: 'solid', color: '#d9d9d9' },
      },
      radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: { width: '100%', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
