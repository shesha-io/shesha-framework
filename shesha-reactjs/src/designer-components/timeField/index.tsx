import React, { FC } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { TimePicker, message } from 'antd';
import moment, { Moment, isMoment } from 'moment';
import ConfigurableFormItem from 'components/formDesigner/components/formItem';
import { customTimeEventHandler } from 'components/formDesigner/components/utils';
import ReadOnlyDisplayFormItem from 'components/readOnlyDisplayFormItem';
import { IToolboxComponent } from 'interfaces';
import { DataTypes } from 'interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from 'providers';
import { FormMarkup, IConfigurableFormComponent } from 'providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from 'providers/form/utils';
import { axiosHttp } from 'utils/fetchers';
import { getNumericValue } from 'utils/string';
import settingsFormJson from './settingsForm.json';
import './styles/index.less';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from 'designer-components/_common-migrations/migrateVisibility';

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
  inputReadOnly?: boolean;
  showNow?: boolean;
  hideDisabledOptions?: boolean;
  use12Hours?: boolean;
  hideBorder?: boolean;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent;
}

const getMoment = (value: any, dateFormat: string): Moment => {
  
  if (value === null || value === undefined) return undefined;
  const values = [isMoment(value) ? value : null, moment(value as string, dateFormat), moment(value as string)];

  const parsed = values.find((i) => isMoment(i) && i.isValid());

  return parsed;
};

const settingsForm = settingsFormJson as FormMarkup;

const TimeField: IToolboxComponent<ITimePickerProps> = {
  type: 'timePicker',
  name: 'Time Picker',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <ClockCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.time,
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
      <ConfigurableFormItem model={model}>
        {(value, onChange) =>  {
          const customEvent =  customTimeEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function') 
              onChange(...args);
          };
          
          return <TimePickerWrapper {...model} {...customEvent} value={value} onChange={onChangeInternal} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => {
    const customModel: ITimePickerProps = {
      ...model,
      format: DATE_TIME_FORMAT,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<ITimePickerProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ITimePickerProps>(1, (prev) => migrateVisibility(prev))
  ,
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
  disabled,
  hideBorder,
  ...rest
}) => {
  const { data: formData } = useFormData();

  
  const evaluatedValue = getMoment(value, format);

  const hourStepLocal = getNumericValue(hourStep);
  const minuteStepLocal = getNumericValue(minuteStep);
  const secondStepLocal = getNumericValue(secondStep);

  const steps = {
    hourStep: 24 % hourStepLocal === 0 ? hourStepLocal : 1, // It should be a factor of 24.
    minuteStep: 60 % minuteStepLocal === 0 ? minuteStepLocal : 1, // It should be a factor of 60.
    secondStep: 60 % secondStepLocal === 0 ? secondStepLocal : 1, // It should be a factor of 60.
  };

  
  const getDefaultRangePickerValues = () =>
    Array.isArray(defaultValue) && defaultValue?.length === 2
      ? defaultValue?.map((v) => moment(new Date(v), format))
      : [null, null];

  const handleTimePickerChange = (localValue: moment.Moment, dateString: string) => {
    const newValue = isMoment(localValue) ? localValue.format(format) : localValue;

    (onChange as TimePickerChangeEvent)(newValue, dateString);
  };

  const handleRangePicker = (values: any[], formatString: [string, string]) => {
    (onChange as RangePickerChangeEvent)(values, formatString);
  };


  if (readOnly) {
    return <ReadOnlyDisplayFormItem value={evaluatedValue?.toISOString()} disabled={disabled} type="time" timeFormat={format} />;
  }

  if (range) {
    return (
      <TimePicker.RangePicker
        bordered={!hideBorder}
        onChange={handleRangePicker}
        format={format}
        defaultValue={getDefaultRangePickerValues() as RangeValue}
        {...steps}
        style={getStyle(style, formData)}
        className="sha-timepicker"
        {...rest}
        placeholder={[placeholder, placeholder]}
      />
    );
  }

  return (
    <TimePicker
      bordered={!hideBorder}
      onChange={handleTimePickerChange}
      format={format}
      defaultValue={evaluatedValue || (defaultValue && moment(defaultValue))}
      {...steps}
      style={getStyle(style, formData)}
      className="sha-timepicker"
      placeholder={placeholder}
      // show
      {...rest}
    />
  );
};

export default TimeField;
