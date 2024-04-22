import { DatePicker } from '@/components/antd';
import moment, { isMoment } from 'moment';
import React, { FC } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useForm, useGlobalState } from '@/providers';
import { getStyle } from '@/providers/form/utils';
import { getMoment } from '@/utils/date';
import { IDateFieldProps, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import {
    DATE_TIME_FORMATS,
    disabledDate,
    getDatePickerValue,
    getDefaultFormat,
    getFormat,
    getRangePickerValues,
} from './utils';

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

export const DatePickerWrapper: FC<IDateFieldProps> = (props) => {

    const { globalState } = useGlobalState();

    const {
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
        propertyName,
        dateFormat = "DD/MM/YYYY",
        ...rest
    } = props;


    const timeFormat = props?.timeFormat || DATE_TIME_FORMATS.time;
    const defaultFormat = getDefaultFormat(props);
    const { formData } = useForm();

    const pickerFormat = getFormat(props);
    const formattedValue = getMoment(value, pickerFormat.toString());

    const handleDatePickerChange = (localValue: any | null, dateString: string) => {
        if (!dateString?.trim()) {
            (onChange as TimePickerChangeEvent)(null, '');
            return;
        }

        const newValue = isMoment(localValue) ? localValue.format(dateFormat ? dateFormat : defaultFormat) : localValue;

        (onChange as TimePickerChangeEvent)(newValue, dateString);
    };

    const handleRangePicker = (values: any[], formatString: [string, string]) => {
        if (formatString?.includes('')) {
            (onChange as RangePickerChangeEvent)(null, null);
            return;
        }

        const dates = (values as []).map((val: any) => {
            if (isMoment(val)) return val.format(dateFormat? dateFormat : defaultFormat);
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
                type="datetime"
                dateFormat={format}
                timeFormat={timeFormat}
            />
        );
    }

    const evaluatedStyle = {width: '100%', ...getStyle(style, formData, globalState)};

    if (range) {
        return (
            <RangePicker
                className="sha-range-picker"
                disabledDate={(e) => disabledDate(props, e, formData, globalState)}
                onChange={handleRangePicker}
                format={dateFormat}
                value={getRangePickerValues(value, dateFormat)}
                defaultValue={getRangePickerValues(defaultValue, dateFormat)}
                {...rest}
                picker={picker}
                showTime={showTime ? (defaultToMidnight ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : true) : false}
                showSecond
                disabled={readOnly}
                style={evaluatedStyle}
                allowClear
                variant={hideBorder ? 'borderless' : undefined}
            />
        );
    }

    return (
        <DatePicker
            className="sha-date-picker"
            disabledDate={(e) => disabledDate(props, e, formData, globalState)}
            //disabled={disabled}
            onChange={handleDatePickerChange}
            variant={hideBorder ? 'borderless' : undefined}
            showTime={showTime ? (defaultToMidnight ? { defaultValue: MIDNIGHT_MOMENT } : true) : false}
            showNow={showNow}
            showToday={showToday}
            showSecond={true}
            picker={picker}
            format={dateFormat}
            style={evaluatedStyle}
            {...rest}
            {...getDatePickerValue(props, dateFormat)}
            allowClear
        />
    );
};
