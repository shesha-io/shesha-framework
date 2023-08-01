import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, message } from 'antd';
import moment, { isMoment } from 'moment';
import React, { FC, Fragment } from 'react';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import { customDateEventHandler } from '../../components/formDesigner/components/utils';
import ReadOnlyDisplayFormItem from '../../components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '../../interfaces';
import { DataTypes } from '../../interfaces/dataTypes';
import { ProperyDataType } from '../../interfaces/metadata';
import { useForm, useFormData, useGlobalState, useMetaProperties, useSheshaApplication } from '../../providers';
import { FormMarkup } from '../../providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '../../providers/form/utils';
import { getMoment, getPropertyMetadata } from '../../utils/date';
import { axiosHttp } from '../../utils/fetchers';
import { IDateFieldProps, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { DATE_TIME_FORMATS, disabledDate, getDefaultFormat, getFormat, getRangePickerValues } from './utils';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';

const META_DATA_FILTERS: ProperyDataType[] = ['date', 'date-time', 'time'];

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

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
    .add<IDateFieldProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
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
    dateOnly,
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

  const defaultFormat = getDefaultFormat(props);

  const { formMode, isComponentDisabled, formData } = useForm();

  const isDisabled = isComponentDisabled(props);

  const isReadOnly = readOnly || formMode === 'readonly';

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
        disabledDate={(e) => disabledDate(props, e)}
        onChange={handleRangePicker}
        format={pickerFormat}
        value={getRangePickerValues(value, pickerFormat)}
        defaultValue={getRangePickerValues(defaultValue, pickerFormat)}
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
      disabledDate={(e) => disabledDate(props, e)}
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
