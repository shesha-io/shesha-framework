import { DatePicker } from '@/components/antd';
import moment from 'moment';
import React, { FC } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useForm, useGlobalState, useMetadata } from '@/providers';
import { getStyle } from '@/providers/form/utils';
import { getMoment } from '@/utils/date';
import { getDataProperty } from '@/utils/metadata';
import { IDateFieldProps, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import {
    DATE_TIME_FORMATS,
    disabledDate,
    formatToISO,
    getDatePickerValue,
    getFormat,
    getRangePickerValues,
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

    const dateFormat = props?.dateFormat || getDataProperty(properties, name) || DATE_TIME_FORMATS.date;
    const timeFormat = props?.timeFormat || DATE_TIME_FORMATS.time;


    const { formData } = useForm();

    const pickerFormat = getFormat(props, properties);
    const formattedValue = getMoment(value);

    const handleDatePickerChange = (_, dateString: string) => {

        if (!dateString?.trim()) {
            (onChange as TimePickerChangeEvent)(null, '');
            return;
        }
        (onChange as TimePickerChangeEvent)(formatToISO(dateString, pickerFormat), dateString);

    };

    const handleRangePicker = (_, formatString: [string, string]) => {
        if (formatString?.includes('')) {
            (onChange as RangePickerChangeEvent)(null, null);
            return;
        }
        const formattedDates = formatString.map((date: string) => (formatToISO(date, pickerFormat)));

        (onChange as RangePickerChangeEvent)(formattedDates, formatString);
    };

    if (readOnly) {
        const format = showTime
            ? `${dateFormat} ${timeFormat}`
            : dateFormat;



        console.log("new values ::", value, defaultValue)

        return (
            <ReadOnlyDisplayFormItem
                value={formattedValue?.toISOString()}
                type="datetime"
                dateFormat={format}
                timeFormat={timeFormat}
            />
        );
    }

    const evaluatedStyle = { width: '100%', ...getStyle(style, formData, globalState) };




    if (range) {
        return (
            <RangePicker
                className="sha-range-picker"
                disabledDate={(e) => disabledDate(props, e, formData, globalState)}
                onChange={handleRangePicker}
                format={pickerFormat}
                value={getRangePickerValues(value)}
                defaultValue={getRangePickerValues(defaultValue)}
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
            format={pickerFormat}
            style={evaluatedStyle}
            {...rest}
            {...getDatePickerValue(props)}
            allowClear
        />
    );
};
