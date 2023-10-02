import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, message } from 'antd';
import moment, { Moment, isMoment } from 'moment';
import React, { FC, Fragment } from 'react';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import { customDateEventHandler } from '../../components/formDesigner/components/utils';
import { HiddenFormItem } from '../../components/hiddenFormItem';
import ReadOnlyDisplayFormItem from '../../components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '../../interfaces';
import { DataTypes } from '../../interfaces/dataTypes';
import { ProperyDataType } from '../../interfaces/metadata';
import { useForm, useFormData, useGlobalState, useMetaProperties, useSheshaApplication } from '../../providers';
import { FormMarkup } from '../../providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '../../providers/form/utils';
import { getMoment, getPropertyMetadata } from '../../utils/date';
import { axiosHttp } from '../../utils/fetchers';
import { IDateFieldProps, IRangeInfo, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { DATE_TIME_FORMATS, disabledDate, getDefaultFormat, getFormat, getRangePickerValues } from './utils';

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
          <DatePickerWrapper {...model} {...customDateEventHandler(eventProps)} />
        </ConfigurableFormItem>

        {model?.range && (
          <Fragment>
            <HiddenFormItem name={`${model?.name}Start`} />
            <HiddenFormItem name={`${model?.name}End`} />
          </Fragment>
        )}
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
  linkToModelMetadata: (model, metadata): IDateFieldProps => {
    return {
      ...model,
      showTime: metadata.dataType === DataTypes.dateTime,
    };
  },
};

export const DatePickerWrapper: FC<IDateFieldProps> = (props) => {
  const properties = useMetaProperties(META_DATA_FILTERS);
  const { globalState } = useGlobalState();

  const {
    name,
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

  const { form, formMode, isComponentDisabled, formData } = useForm();

  const isDisabled = isComponentDisabled(props);

  const isReadOnly = readOnly || formMode === 'readonly';

  const pickerFormat = getFormat(props, properties);

  const formattedValue = getMoment(value, pickerFormat);

  const showDatePickerTime = showTime ? (defaultToMidnight ? { defaultValue: MIDNIGHT_MOMENT } : true) : false;

  const datePickerValue = showDatePickerTime ? { defaultValue: formattedValue } : { value: formattedValue };

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

  const onCalendarChange = (values: Moment[], _formatString: [string, string], info: IRangeInfo) => {
    const startDate = Array.isArray(values) && values[0];
    const endDate = Array.isArray(values) && values[1];

    if (info?.range === 'end' && form) {
      form.setFieldsValue({
        [`${name}Start`]: isMoment(startDate) ? startDate?.format() : null,
        [`${name}End`]: isMoment(endDate) ? endDate?.format() : null,
      });
    }
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

  const evaluatedStyle = style ? getStyle(style, formData, globalState) : { width: '100%' };

  if (range) {
    return (
      <RangePicker
        className="sha-range-picker"
        disabledDate={(e) => disabledDate(props, e, formData, globalState)}
        onCalendarChange={onCalendarChange}
        onChange={handleRangePicker}
        format={pickerFormat}
        value={getRangePickerValues(value, pickerFormat)}
        defaultValue={getRangePickerValues(defaultValue, pickerFormat)}
        {...rest}
        picker={picker}
        showTime={showTime ? (defaultToMidnight ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : true) : false}
        showSecond
        disabled={isDisabled}
        style={evaluatedStyle}
        allowClear
      />
    );
  }

  return (
    <DatePicker
      className="sha-date-picker"
      disabledDate={(e) => disabledDate(props, e, formData, globalState)}
      disabled={isDisabled}
      onChange={handleDatePickerChange}
      bordered={!hideBorder}
      showTime={showDatePickerTime}
      showNow={showNow}
      showToday={showToday}
      showSecond={true}
      picker={picker}
      format={pickerFormat}
      style={evaluatedStyle}
      {...datePickerValue}
      {...rest}
      allowClear
    />
  );
};

export default DateField;
