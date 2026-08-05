import moment, { Moment } from 'moment';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { getDataProperty } from '@/utils/metadata';
import { DateBindingFormat, DateSelectionType, DisabledDateTemplate, IDateFieldProps } from './interfaces';
import { range } from 'lodash';
import { IStyleValue } from "@/providers/form/models";
import { DatePicker } from '@/components/antd';
import { DATE_TIME_FORMATS } from '@/constants/formats';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

/** antd picker driven by each selection type. */
const SELECTION_TYPE_PICKERS: Record<DateSelectionType, 'date' | 'week' | 'month' | 'quarter' | 'year'> = {
  dateTimeHours: 'date',
  dateTimeMinutes: 'date',
  dateTimeSeconds: 'date',
  date: 'date',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
};

/** Time-part format per selection type; `undefined` means the selection carries no time. */
const SELECTION_TYPE_TIME_FORMATS: Partial<Record<DateSelectionType, string>> = {
  dateTimeHours: 'HH',
  dateTimeMinutes: 'HH:mm',
  dateTimeSeconds: 'HH:mm:ss',
};

export const DEFAULT_SELECTION_TYPE: DateSelectionType = 'dateTimeMinutes';

export const getSelectionType = (props: IDateFieldProps): DateSelectionType =>
  props.selectionType ?? DEFAULT_SELECTION_TYPE;

/** The antd `picker` prop for the configured selection type. */
export const getPicker = (props: IDateFieldProps): 'date' | 'week' | 'month' | 'quarter' | 'year' =>
  SELECTION_TYPE_PICKERS[getSelectionType(props)];

/** Whether the configured selection type includes a time component. */
export const hasTimePart = (props: IDateFieldProps): boolean =>
  isDefined(SELECTION_TYPE_TIME_FORMATS[getSelectionType(props)]);

/** Whether the minute step setting applies (minutes are shown but seconds granularity is separate). */
export const supportsMinuteStep = (props: IDateFieldProps): boolean => {
  const selectionType = getSelectionType(props);
  return selectionType === 'dateTimeMinutes' || selectionType === 'dateTimeSeconds';
};

type DisabledDateFunc = (current: Moment, momentFunc: typeof moment, data: object | undefined, globalState: object) => boolean;

export function disabledDate(props: IDateFieldProps, current: Moment, data: object | undefined, globalState: object): boolean {
  const { dateRestriction } = props;

  // Date Restriction supersedes the legacy disabledDateMode/template pair.
  if (dateRestriction === 'past') return current.isBefore(moment().startOf('day'));
  if (dateRestriction === 'future') return current.isAfter(moment().endOf('day'));

  return legacyDisabledDate(props, current, data, globalState);
}

function legacyDisabledDate(props: IDateFieldProps, current: Moment, data: object | undefined, globalState: object): boolean {
  const { disabledDateMode, disabledDateTemplate, disabledDateFunc } = props;

  if (disabledDateMode === 'none') return false;

  const disabledTimeExpression = disabledDateMode === 'functionTemplate' ? disabledDateTemplate : disabledDateFunc;

  if (!isNullOrWhiteSpace(disabledTimeExpression)) {
    const disabledFunc = new Function('current', 'moment', 'data', 'globalState', disabledTimeExpression) as DisabledDateFunc;

    return disabledFunc(current, moment, data ?? {}, globalState);
  } else
    return false;
}

/** The binding format in effect, falling back to the legacy `resolveToUTC` boolean for old models. */
export const getBindingFormat = (props: IDateFieldProps): DateBindingFormat =>
  props.bindingFormat ?? (props.resolveToUTC === true ? 'utc' : 'isoLocal');

/**
 * Serialise a picked moment according to the configured binding format. `ticks` uses .NET ticks
 * (100ns intervals since 0001-01-01) so the value round-trips with a .NET DateTime on the backend.
 */
export const serializeValue = (value: Moment, props: IDateFieldProps): string => {
  switch (getBindingFormat(props)) {
    case 'utc':
      return value.clone().utc().toISOString();
    case 'isoLocal':
      return value.clone().local().format('YYYY-MM-DDTHH:mm:ss.SSS');
    case 'isoOffset':
      return value.clone().local().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    case 'dateOnly':
      return value.clone().format('YYYY-MM-DD');
    case 'ticks': {
      const TICKS_PER_MS = 10000;
      const MS_AT_UNIX_EPOCH = 62135596800000;
      return String((value.clone().valueOf() + MS_AT_UNIX_EPOCH) * TICKS_PER_MS);
    }
    case 'unix':
      return String(value.clone().unix());
    default:
      return value.clone().local().format('YYYY-MM-DDTHH:mm:ss.SSS');
  }
};

export const timeObject = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
};

const disabledTimeTemplateFunc = (disabledTimeTemplate: DisabledDateTemplate | undefined) => {
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


type DatePickerProps = React.ComponentProps<typeof DatePicker>;
type DisabledTimeFunc = Required<DatePickerProps>['disabledTime'];
type DisabledTimes = ReturnType<DisabledTimeFunc>;

type DisabledTimeFuncFactory = (current: Moment, momentFunc: typeof moment, data: object | undefined, globalState: object, rangeFunc: typeof range) => DisabledTimes;

const emptyDisabledTime: DisabledTimeFunc = () => ({ disabledHours: () => [], disabledMinutes: () => [], disabledSeconds: () => [] });

export const disabledTime = (props: IDateFieldProps, data: object = {}, globalState: object): DisabledTimeFunc => {
  const { disabledTimeMode, disabledTimeTemplate, disabledTimeFunc } = props;

  if (disabledTimeMode === 'none')
    return emptyDisabledTime;

  if (disabledTimeMode === 'timeFunctionTemplate') {
    return disabledTimeTemplateFunc(disabledTimeTemplate);
  }

  if (!isNullOrWhiteSpace(disabledTimeFunc)) {
    const disabledFunc = new Function('current', 'moment', 'data', 'globalState', 'range', disabledTimeFunc) as DisabledTimeFuncFactory;

    type DisabledTimeCurrent = Parameters<NonNullable<DisabledTimeFunc>>[0];
    return (current: DisabledTimeCurrent) => disabledFunc(current, moment, data, globalState, range);
  }

  return emptyDisabledTime;
};

export const getFormat = (props: IDateFieldProps, properties: IPropertyMetadata[]): string => {
  const { propertyName } = props;
  const selectionType = getSelectionType(props);

  const metadataFormat = !isNullOrWhiteSpace(propertyName) ? getDataProperty(properties, propertyName, 'dataFormat') : undefined;
  const dateFormat = isNotNullOrWhiteSpace(props.dateFormat)
    ? props.dateFormat
    : isNotNullOrWhiteSpace(metadataFormat) ? metadataFormat : DATE_TIME_FORMATS.date;
  const yearFormat = isNotNullOrWhiteSpace(props.yearFormat) ? props.yearFormat : DATE_TIME_FORMATS.year;
  const quarterFormat = isNotNullOrWhiteSpace(props.quarterFormat) ? props.quarterFormat : DATE_TIME_FORMATS.quarter;
  const monthFormat = isNotNullOrWhiteSpace(props.monthFormat) ? props.monthFormat : DATE_TIME_FORMATS.month;
  const weekFormat = isNotNullOrWhiteSpace(props.weekFormat) ? props.weekFormat : DATE_TIME_FORMATS.week;

  switch (selectionType) {
    case 'year':
      return yearFormat;
    case 'month':
      return monthFormat;
    case 'quarter':
      return quarterFormat;
    case 'week':
      return weekFormat;
    case 'date':
      return dateFormat;
    default: {
      // A date+time selection: append the time part at the precision the selection type implies.
      // An explicitly configured Time Format wins over the derived one.
      const derivedTimeFormat = SELECTION_TYPE_TIME_FORMATS[selectionType];
      const timeFormat = isNotNullOrWhiteSpace(props.timeFormat)
        ? props.timeFormat
        : isNotNullOrWhiteSpace(derivedTimeFormat) ? derivedTimeFormat : DATE_TIME_FORMATS.time;
      return `${dateFormat} ${timeFormat}`;
    }
  }
};

export const defaultStyles = (): IStyleValue => {
  return {
    // The compound background slots (size/position/repeat/url/gradient) are all listed deliberately:
    // an Appearance input whose property is absent from the defaults renders no inheritance popover.
    background: {
      type: 'color',
      color: '#fff',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: {} },
      url: '',
    },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI', align: 'left' },
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
    shadow: { offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 0, color: '#00000000' },
  };
};
