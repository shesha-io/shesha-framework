import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, message } from 'antd';
import moment, { isMoment } from 'moment';
import React, { FC, Fragment } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customDateEventHandler } from '@/components/formDesigner/components/utils';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useMetadata, useSheshaApplication } from '../../providers';
import { FormMarkup } from '@/providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getMoment } from '@/utils/date';
import { getDataFormat } from '@/utils/metadata';
import { axiosHttp } from '@/utils/fetchers';
import { IDateFieldProps, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import settingsFormJson from './settingsForm.json';
import {
  DATE_TIME_FORMATS,
  disabledDate,
  getDatePickerValue,
  getDefaultFormat,
  getFormat,
  getRangePickerValues,
} from './utils';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

const settingsForm = settingsFormJson as FormMarkup;

const DateField: IToolboxComponent<IDateFieldProps> = {
  type: 'dateField',
  name: 'Date field',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <CalendarOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.date || dataType === DataTypes.dateTime,
  Factory: ({ model, form }) => {
    const { formMode, setFormData } = useForm();
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
      setFormData,
      setGlobalState,
    };

    return (
      <Fragment>
        <ConfigurableFormItem model={model}>
          {(value, onChange) => {
            const customEvent =  customDateEventHandler(eventProps);
            const onChangeInternal = (...args: any[]) => {
              customEvent.onChange(args[0], args[1]);
              if (typeof onChange === 'function') 
                onChange(...args);
            };
            
            return <DatePickerWrapper {...model} {...customEvent} value={value} onChange={onChangeInternal} />;
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
    .add<IDateFieldProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDateFieldProps>(1, (prev) => migrateVisibility(prev))
  ,
  linkToModelMetadata: (model, metadata): IDateFieldProps => {

    return {
      ...model,
      showTime: metadata.dataType === DataTypes.date ? false : model.showTime,
    };
  },
};

export const DatePickerWrapper: FC<IDateFieldProps> = (props) => {
  const { properties = [] } = useMetadata(false)?.metadata ?? {};

  const { globalState } = useGlobalState();

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

  const dateFormat = props?.dateFormat || getDataFormat(properties, name) || DATE_TIME_FORMATS.date;
  const timeFormat = props?.timeFormat || DATE_TIME_FORMATS.time;

  const defaultFormat = getDefaultFormat(props);

  const { formData } = useForm();

  const pickerFormat = getFormat(props, properties);
  const formattedValue = getMoment(value, pickerFormat);

  const handleDatePickerChange = (localValue: any | null, dateString: string) => {
    if (!dateString?.trim()) {
      (onChange as TimePickerChangeEvent)(null, '');
      return;
    }

    const newValue = isMoment(localValue) ? localValue.format(defaultFormat) : localValue;

    (onChange as TimePickerChangeEvent)(newValue, dateString);
  };

  const handleRangePicker = (values: any[], formatString: [string, string]) => {
    if (formatString?.includes('')) {
      (onChange as RangePickerChangeEvent)(null, null);
      return;
    }

    const dates = (values as []).map((val: any) => {
      if (isMoment(val)) return val.format(defaultFormat);

      return val;
    });

    (onChange as RangePickerChangeEvent)(dates, formatString);
  };

  if (readOnly) {
    const format = showTime
      ? `${dateFormat} ${timeFormat}`
      : dateFormat;

    return (
      <ReadOnlyDisplayFormItem
        value={formattedValue?.toISOString()}
        disabled={disabled}
        type="datetime"
        dateFormat={format}
        timeFormat={timeFormat}
      />
    );
  }

  const evaluatedStyle = style ? getStyle(style, formData, globalState) : { width: '100%' };

  if (range) {
    return (
      <RangePicker
        className="sha-range-picker"
        disabledDate={(e) => disabledDate(props, e, formData, globalState)}
        onChange={handleRangePicker}
        format={pickerFormat}
        value={getRangePickerValues(value, pickerFormat)}
        defaultValue={getRangePickerValues(defaultValue, pickerFormat)}
        {...rest}
        picker={picker}
        showTime={showTime ? (defaultToMidnight ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : true) : false}
        showSecond
        disabled={disabled}
        style={evaluatedStyle}
        allowClear
        bordered={!hideBorder}
      />
    );
  }

  return (
    <DatePicker
      className="sha-date-picker"
      disabledDate={(e) => disabledDate(props, e, formData, globalState)}
      disabled={disabled}
      onChange={handleDatePickerChange}
      bordered={!hideBorder}
      showTime={showTime ? (defaultToMidnight ? { defaultValue: MIDNIGHT_MOMENT } : true) : false}
      showNow={showNow}
      showToday={showToday}
      showSecond={true}
      picker={picker}
      format={pickerFormat}
      style={evaluatedStyle}
      {...rest}
      {...getDatePickerValue(props, pickerFormat)}
      allowClear
    />
  );
};

export default DateField;
