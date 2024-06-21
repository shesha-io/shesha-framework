import { DatePicker } from '@/components/antd';
import moment, { isMoment } from 'moment';
import React, { FC, useMemo } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useForm, useGlobalState, useMetadata } from '@/providers';
import { getStyle } from '@/providers/form/utils';
import { getMoment, getRangeMoment } from '@/utils/date';
import { getDataProperty } from '@/utils/metadata';
import { IDateFieldProps, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import {
    DATE_TIME_FORMATS,
    disabledDate,
    getFormat,
} from './utils';
import { asPropertiesArray } from '@/interfaces/metadata';

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

export const DatePickerWrapper: FC<IDateFieldProps> = (props) => {
    const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);

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
      const val = picker === 'week'
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

    const evaluatedStyle = { width: '100%', ...getStyle(style, formData, globalState) };

    const momentValue = useMemo(() => getMoment(value, pickerFormat), [value, pickerFormat]);
    const rangeMomentValue = useMemo(() => getRangeMoment(value, pickerFormat), [value, pickerFormat]);
    const defaultMomentValue = useMemo(() => getRangeMoment(defaultValue, pickerFormat), [defaultValue, pickerFormat]);

    if (range) {
        return (
            <RangePicker
                className="sha-range-picker"
                disabledDate={(e) => disabledDate(props, e, formData, globalState)}
                onChange={handleRangePicker}
                format={pickerFormat}
                value={rangeMomentValue}
                defaultValue={defaultMomentValue}
                {...rest}
                picker={picker}
                showTime={showTime ? (defaultToMidnight ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : true) : false}
                disabled={readOnly}
                style={evaluatedStyle}
                allowClear
                variant={hideBorder ? 'borderless' : undefined}
            />
        );
    }

    if (readOnly) {
      const format = showTime ? `${dateFormat} ${timeFormat}` : dateFormat;
      return (
        <ReadOnlyDisplayFormItem
          value={momentValue}
          type="datetime"
          dateFormat={format}
          timeFormat={timeFormat}
        />
      );
    }

    return (
        <DatePicker
            className="sha-date-picker"
            disabledDate={(e) => disabledDate(props, e, formData, globalState)}
            onChange={handleDatePickerChange}
            variant={hideBorder ? 'borderless' : undefined}
            showTime={showTime ? (defaultToMidnight ? { defaultValue: MIDNIGHT_MOMENT } : true) : false}
            showNow={showNow}
            picker={picker}
            format={pickerFormat}
            style={evaluatedStyle}
            {...rest}
            value={momentValue}
            allowClear
        />
    );
};
