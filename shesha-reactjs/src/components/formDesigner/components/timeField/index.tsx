import React, { FC, Fragment } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { ClockCircleOutlined } from '@ant-design/icons';
import { TimePicker } from 'antd';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import moment, { Moment, isMoment } from 'moment';

import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import { HiddenFormItem } from '../../../hiddenFormItem';
import { DataTypes } from '../../../../interfaces/dataTypes';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { getNumericValue } from '../../../../utils/string';

type RangeType = 'start' | 'end';
// tslint:disable-next-line:interface-over-type-literal
type RangeInfo = {
  range: RangeType;
};

type RangeValue = [moment.Moment, moment.Moment];

const DATE_TIME_FORMAT = 'HH:mm';

type TimePickerChangeEvent = (value: any | null, dateString: string) => void;
type RangePickerChangeEvent = (values: any, formatString: [string, string]) => void;

export interface ITimePickerProps extends IConfigurableFormComponent {
  className?: string;
  defaultValue?: string | [string, string];
  format?: string;
  value?: string | [string, string];
  placeholder?: string;
  popupClassName?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabled?: boolean; // Use
  range?: boolean; // Use
  allowClear?: boolean;
  autoFocus?: boolean;
  bordered?: boolean;
  inputReadOnly?: boolean;
  showNow?: boolean;
  hideDisabledOptions?: boolean;
  use12Hours?: boolean;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent;
}

const getMoment = (value: any, dateFormat: string): Moment => {
  if (value === null || value === undefined) return undefined;

  const values = [isMoment(value) ? value : null, moment(value as string, dateFormat), moment(value as string)];

  const parsed = values.find(i => isMoment(i) && i.isValid());

  return parsed;
};

const settingsForm = settingsFormJson as FormMarkup;

const TimeField: IToolboxComponent<ITimePickerProps> = {
  type: 'timePicker',
  name: 'Time Picker',
  icon: <ClockCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.time,
  factory: (model: ITimePickerProps) => {
    return (
      <Fragment>
        <ConfigurableFormItem model={model}>
          <TimePickerWrapper {...model} />
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
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const customModel: ITimePickerProps = {
      ...model,
      format: DATE_TIME_FORMAT,
    };
    return customModel;
  },
};

export const TimePickerWrapper: FC<ITimePickerProps> = ({
  onChange,
  range,
  value,
  defaultValue,
  placeholder,
  format = DATE_TIME_FORMAT,
  readOnly,
  style,
  hourStep,
  minuteStep,
  secondStep,
  ...rest
}) => {
  const { form, formMode, formData, isComponentDisabled } = useForm();
  const evaluatedValue = getMoment(value, format);

  const hourStepLocal = getNumericValue(hourStep);
  const minuteStepLocal = getNumericValue(minuteStep);
  const secondStepLocal = getNumericValue(secondStep);

  const steps = {
    hourStep: 24 % hourStepLocal === 0 ? hourStepLocal : 1, // It should be a factor of 24.
    minuteStep: 60 % minuteStepLocal === 0 ? minuteStepLocal : 1, // It should be a factor of 60.
    secondStep: 60 % secondStepLocal === 0 ? secondStepLocal : 1, // It should be a factor of 60.
  };

  const isDisabled = isComponentDisabled(rest);

  const isReadOnly = readOnly || formMode === 'readonly';

  const getDefaultRangePickerValues = () =>
    Array.isArray(defaultValue) && defaultValue?.length === 2
      ? defaultValue?.map(v => moment(new Date(v), format))
      : [null, null];

  const handleTimePickerChange = (localValue: moment.Moment, dateString: string) => {
    const newValue = isMoment(localValue) ? localValue.format(format) : localValue;

    (onChange as TimePickerChangeEvent)(newValue, dateString);
  };

  const handleRangePicker = (values: any[], formatString: [string, string]) => {
    (onChange as RangePickerChangeEvent)(values, formatString);
  };

  const onCalendarChange = (_, formatString: [string, string], info: RangeInfo) => {
    if (info?.range === 'end' && form) {
      form.setFieldsValue({
        [`${rest?.name}Start`]: formatString[0],
        [`${rest?.name}End`]: formatString[1],
      });
    }
  };

  if (isReadOnly) {
    return <ReadOnlyDisplayFormItem value={evaluatedValue?.toISOString()} disabled={isDisabled} type="time" />;
  }

  if (range) {
    return (
      <TimePicker.RangePicker
        onChange={handleRangePicker}
        onCalendarChange={onCalendarChange}
        format={format}
        defaultValue={getDefaultRangePickerValues() as RangeValue}
        {...steps}
        style={getStyle(style, formData)}
        {...rest}
        placeholder={null}
      />
    );
  }

  return (
    <TimePicker
      value={evaluatedValue}
      onChange={handleTimePickerChange}
      format={format}
      defaultValue={defaultValue && moment(defaultValue)}
      {...steps}
      style={getStyle(style, formData)}
      // show
      {...rest}
    />
  );
};

export default TimeField;
