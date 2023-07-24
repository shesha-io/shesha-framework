import React, { FC, Fragment } from 'react';
import { IToolboxComponent } from '../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../providers/form/models';
import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, message } from 'antd';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import moment, { isMoment } from 'moment';
import { getStyle, validateConfigurableComponentSettings } from '../../providers/form/utils';
import { useForm, useFormData, useGlobalState, useMetaProperties, useSheshaApplication } from '../../providers';
import { DataTypes } from '../../interfaces/dataTypes';
import ReadOnlyDisplayFormItem from '../../components/readOnlyDisplayFormItem';
import { getPropertyMetadata, getMoment } from '../../utils/date';
import { customDateEventHandler } from '../../components/formDesigner/components/utils';
import { axiosHttp } from '../../utils/fetchers';
import { ProperyDataType } from '../../interfaces/metadata';
import { migratePropertyName } from 'designer-components/_settings/utils';

const DATE_TIME_FORMATS = {
  time: 'HH:mm:ss',
  week: 'YYYY-wo',
  date: 'DD/MM/YYYY',
  quarter: 'YYYY-\\QQ',
  month: 'YYYY-MM',
  year: 'YYYY',
};

const META_DATA_FILTERS: ProperyDataType[] = ['date', 'date-time', 'time'];

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

type RangeValue = [moment.Moment, moment.Moment];

type TimePickerChangeEvent = (value: any | null, dateString: string) => void;
type RangePickerChangeEvent = (values: any, formatString: [string, string]) => void;

export interface IDateFieldProps extends IConfigurableFormComponent {
  dateFormat?: string;
  value?: any;
  hideBorder?: boolean;
  showTime?: boolean;
  showNow?: boolean;
  defaultToMidnight?: boolean;
  showToday?: boolean;
  timeFormat?: string;
  yearFormat?: string;
  quarterFormat?: string;
  monthFormat?: string;
  weekFormat?: string;
  range?: boolean;
  picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
  disablePastDates?: boolean;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent;
  disabledDateMode?: 'none' | 'functionTemplate' | 'customFunction';
  disabledDateTemplate?: string;
  disabledDateFunc?: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const DateField: IToolboxComponent<IDateFieldProps> = {
  type: 'dateField',
  name: 'Date field',
  isInput: true,
  isOutput: true,
  icon: <CalendarOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.date || dataType === DataTypes.dateTime,
  factory: (model: IDateFieldProps, _c, form) => {
    const { formMode, setFormDataAndInstance } = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const eventProps = {
      model,
      form,
      formData,
      formMode,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setFormData: setFormDataAndInstance,
      setGlobalState,
    };

    return (
      <Fragment>
        <ConfigurableFormItem model={model}>
          {(value, onChange) => {
            return <DatePickerWrapper {...model} {...customDateEventHandler(eventProps)} value={value} onChange={onChange} />;
          }}
        </ConfigurableFormItem>
      </Fragment>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => {
    const customModel: IDateFieldProps = {
      ...model,
      picker: 'date',
      showTime: false,
      dateFormat: DATE_TIME_FORMATS?.date,
      timeFormat: DATE_TIME_FORMATS.time,
      defaultToMidnight: true,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IDateFieldProps>(0, (prev) => migratePropertyName(prev))
  ,
  linkToModelMetadata: (model, metadata): IDateFieldProps => {
    return {
      ...model,
      showTime: metadata.dataType === DataTypes.dateTime,
    };
  },
};

export const DatePickerWrapper: FC<IDateFieldProps> = (props) => {
  const properties = useMetaProperties(META_DATA_FILTERS);

  const {
    propertyName: name,
    disabled,
    hideBorder,
    range,
    value,
    showTime,
    showNow,
    showToday,
    onChange,
    picker = 'date',
    defaultValue,
    disabledDateMode,
    disabledDateTemplate,
    disabledDateFunc,
    readOnly,
    style,
    defaultToMidnight,
    ...rest
  } = props;

  const dateFormat = props?.dateFormat || getPropertyMetadata(properties, name) || DATE_TIME_FORMATS.date;
  const timeFormat = props?.timeFormat || DATE_TIME_FORMATS.time;
  const yearFormat = props?.yearFormat || DATE_TIME_FORMATS.year;
  const quarterFormat = props?.quarterFormat || DATE_TIME_FORMATS.quarter;
  const monthFormat = props?.monthFormat || DATE_TIME_FORMATS.month;
  const weekFormat = props?.weekFormat || DATE_TIME_FORMATS.week;

  const { formMode, isComponentDisabled, formData } = useForm();

  const isDisabled = isComponentDisabled(props);

  const isReadOnly = readOnly || formMode === 'readonly';

  const getFormat = () => {
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

  const pickerFormat = getFormat();

  const formattedValue = getMoment(value, pickerFormat);

  const getRangePickerValues = (valueToUse: any) =>
    (Array.isArray(valueToUse) && valueToUse?.length === 2
      ? valueToUse?.map((v) => moment(new Date(v), pickerFormat))
      : [null, null]) as RangeValue;

  const handleDatePickerChange = (localValue: any | null, dateString: string) => {
    if (!dateString?.trim()) {
      (onChange as TimePickerChangeEvent)(null, '');
      return;
    }

    const newValue = isMoment(localValue) ? localValue.format() : localValue;

    (onChange as TimePickerChangeEvent)(newValue, dateString);
  };

  const handleRangePicker = (values: any[], formatString: [string, string]) => {
    if (formatString?.includes('')) {
      (onChange as RangePickerChangeEvent)(null, null);
      return;
    }

    const dates = (values as []).map((val: any) => {
      if (isMoment(val)) return val.format();

      return val;
    });

    (onChange as RangePickerChangeEvent)(dates, formatString);
  };

  function disabledDate(current) {
    if (disabledDateMode === 'none') return false;

    const disabledTimeExpression = disabledDateMode === 'functionTemplate' ? disabledDateTemplate : disabledDateFunc;

    // tslint:disable-next-line:function-constructor
    const disabledFunc = new Function('current', 'moment', disabledTimeExpression);

    return disabledFunc(current, moment);
  }

  if (isReadOnly) {
    const format = `${dateFormat}${showTime ? timeFormat : ''}`;

    return (
      <ReadOnlyDisplayFormItem
        value={formattedValue?.toISOString()}
        disabled={isDisabled}
        type="datetime"
        dateFormat={format}
        timeFormat={timeFormat}
      />
    );
  }

  if (range) {
    return (
      <RangePicker
        className="sha-range-picker"
        disabledDate={disabledDate}
        onChange={handleRangePicker}
        format={pickerFormat}
        value={getRangePickerValues(value)}
        defaultValue={getRangePickerValues(defaultValue)}
        {...rest}
        picker={picker}
        showTime={showTime ? (defaultToMidnight ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : true) : false}
        showSecond
        disabled={isDisabled}
        style={getStyle(style, formData)}
        allowClear
      />
    );
  }

  return (
    <DatePicker
      className="sha-date-picker"
      value={formattedValue}
      disabledDate={disabledDate}
      disabled={isDisabled}
      onChange={handleDatePickerChange}
      bordered={!hideBorder}
      showTime={showTime ? (defaultToMidnight ? { defaultValue: MIDNIGHT_MOMENT } : true) : false}
      showNow={showNow}
      showToday={showToday}
      showSecond={true}
      picker={picker}
      format={pickerFormat}
      style={getStyle(style, formData)}
      {...rest}
      allowClear
    />
  );
};

export default DateField;
