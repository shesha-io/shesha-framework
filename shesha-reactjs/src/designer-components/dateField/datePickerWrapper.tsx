import { DatePicker } from '@/components/antd';
import moment, { isMoment } from 'moment';
import React, { FC, useEffect, useMemo, useState } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useForm, useGlobalState, useMetadata } from '@/providers';
import { getStyle } from '@/providers/form/utils';
import { getMoment, getRangeMoment } from '@/utils/date';
import { getDataProperty } from '@/utils/metadata';
import { IDateFieldProps, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import { DATE_TIME_FORMATS, disabledDate, disabledTime, getFormat } from './utils';
import { asPropertiesArray } from '@/interfaces/metadata';

const { RangePicker } = DatePicker;

export const DatePickerWrapper: FC<IDateFieldProps> = (props) => {
  const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
  const properties = asPropertiesArray(metaProperties, []);
  const [MIDNIGHT_MOMENT, setMIDNIGHT_MOMENT] = useState(moment('00:00:00', 'HH:mm:ss'));
  const [momentValue, setMomentValue] = useState<moment.Moment | null>(null);
  const [rangeMomentValue, setRangeMomentValue] = useState<any>(null);

  const { globalState } = useGlobalState();

  const {
    propertyName: name,
    hideBorder,
    range,
    value,
    showTime,
    showNow,
    onChange,
    picker = 'date',
    defaultValue,
    disabledDateMode,
    disabledDateTemplate,
    disabledDateFunc,
    disabledTimeMode,
    disabledTimeTemplate,
    disabledTimeFunc,
    readOnly,
    style,
    defaultToMidnight,
    resolveToUTC,
    ...rest
  } = props;

  const dateFormat = props?.dateFormat || getDataProperty(properties, name) || DATE_TIME_FORMATS.date;
  const timeFormat = props?.timeFormat || DATE_TIME_FORMATS.time;

  const { formData } = useForm();

  const pickerFormat = getFormat(props, properties);

  const convertValue = (localValue: any) => {
    const newValue = isMoment(localValue) ? localValue : getMoment(localValue, pickerFormat);
    const val =
      picker === 'week'
        ? newValue.startOf('week')
        : picker === 'month'
          ? newValue.startOf('month')
          : picker === 'quarter'
            ? newValue.startOf('quarter')
            : picker === 'year'
              ? newValue.startOf('year')
              : !showTime
                ? newValue.startOf('day')
                : newValue;
    return !resolveToUTC ? val.utc(true) : val.local(true);
  };

  const handleDatePickerChange = (localValue: any | null, dateString: string) => {
    if (!dateString?.trim()) {
      (onChange as TimePickerChangeEvent)(null, '');
      return;
    }
    const newValue = convertValue(localValue);
    (onChange as TimePickerChangeEvent)(newValue, dateString);
  };

  const handleRangePicker = (values: any[], formatString: [string, string]) => {
    if (formatString?.includes('')) {
      (onChange as RangePickerChangeEvent)(null, null);
      return;
    }
    const dates = (values as []).map((val: any) => convertValue(val));

    (onChange as RangePickerChangeEvent)(dates, formatString);
  };

  const handleOnOk = (value: moment.Moment | null) => handleDatePickerChange(value, value?.format(pickerFormat));

  const getCurrentTime = () => {
    // Reset the state to null
    setMomentValue(null);
    setRangeMomentValue(null);

    if (defaultToMidnight) {
      setMIDNIGHT_MOMENT(moment('00:00:00', 'HH:mm:ss'));
    } else {
      // Get the current system time as a Moment object and format it to 'HH:mm:ss'
      const MIDNIGHT = moment().set({
        hour: moment().hour(),
        minute: moment().minute(),
        second: moment().second(),
        millisecond: 0,
      });
      setMIDNIGHT_MOMENT(moment(MIDNIGHT.format('HH:mm:ss')));
    }
  };

  const evaluatedStyle = { width: '100%', ...getStyle(style, formData, globalState) };
  const defaultMomentValue = useMemo(() => getRangeMoment(defaultValue, pickerFormat), [defaultValue, pickerFormat]);

  useEffect(() => {
    if (range) {
      const newRangeMomentValue = getRangeMoment(value, pickerFormat);
      setRangeMomentValue(newRangeMomentValue);
    } else {
      const newMomentValue = getMoment(value, pickerFormat);
      setMomentValue(newMomentValue);
    }
  }, [value, pickerFormat]);

  if (range) {
    return (
      <RangePicker
        className="sha-range-picker"
        disabledDate={(e) => disabledDate(props, e, formData, globalState)}
        disabledTime={disabledTime(props, formData, globalState)}
        onChange={handleRangePicker}
        format={pickerFormat}
        value={rangeMomentValue}
        defaultValue={defaultMomentValue}
        {...rest}
        picker={picker}
        showTime={showTime ? { defaultOpenValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : false}
        disabled={readOnly}
        style={evaluatedStyle}
        allowClear
        variant={hideBorder ? 'borderless' : undefined}
        onClick={getCurrentTime}
      />
    );
  }

  if (readOnly) {
    const format = showTime ? `${dateFormat} ${timeFormat}` : dateFormat;
    return <ReadOnlyDisplayFormItem value={momentValue} type="datetime" dateFormat={format} timeFormat={timeFormat} />;
  }

  return (
    <DatePicker
      className="sha-date-picker"
      disabledDate={(e) => disabledDate(props, e, formData, globalState)}
      disabledTime={disabledTime(props, formData, globalState)}
      onChange={handleDatePickerChange}
      onOk={handleOnOk}
      variant={hideBorder ? 'borderless' : undefined}
      showTime={showTime ? { defaultOpenValue: MIDNIGHT_MOMENT } : false}
      showNow={showNow}
      picker={picker}
      format={pickerFormat}
      style={evaluatedStyle}
      {...rest}
      value={momentValue}
      allowClear
      onClick={getCurrentTime}
    />
  );
};
