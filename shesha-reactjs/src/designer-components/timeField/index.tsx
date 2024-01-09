import React, { FC } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { TimeRangePicker, TimePicker } from '@/components/antd';
import moment, { Moment, isMoment } from 'moment';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customTimeEventHandler } from '@/components/formDesigner/components/utils';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import { getNumericValue } from '@/utils/string';
import settingsFormJson from './settingsForm.json';
import './styles/index.less';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { TimeSteps } from '@/components/antd/timepicker';

type RangeValue = [moment.Moment, moment.Moment];

const DATE_TIME_FORMAT = 'HH:mm';

type TimePickerChangeEvent = (value: number | null, timeString: string) => void;
type RangePickerChangeEvent = (values: number[] | null, timeString: [string, string]) => void;

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
  const values = [
    isMoment(value) ? value : null,
    typeof(value) === 'number' ? moment.utc(value * 1000) : null, // time in millis
    typeof(value) === 'string' ? moment(value as string, dateFormat) : null, 
    typeof(value) === 'string' ? moment(value as string) : null
  ];

  const parsed = values.find((i) => isMoment(i) && i.isValid());

  return parsed;
};

const getTotalSeconds = (value: Moment): number => {
  if (!isMoment(value) || !value.isValid())
    return undefined;

  const timeOnly = moment.duration({
    hours: value.hours(),
    minutes: value.minutes(),
    seconds: value.seconds()
  });
  return timeOnly.asSeconds();
};

const settingsForm = settingsFormJson as FormMarkup;

export const TimeFieldComponent: IToolboxComponent<ITimePickerProps> = {
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
    .add<ITimePickerProps>(2, (prev) => migrateReadOnly(prev))
  ,
};

const TimePickerWrapper: FC<ITimePickerProps> = ({
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

  const steps: TimeSteps = {
    hourStep: 1 <= hourStepLocal && hourStepLocal <= 23 ? hourStepLocal as TimeSteps['hourStep'] : 1, // value should be in range 1..23
    minuteStep: 1 <= minuteStepLocal && minuteStepLocal <= 59 ? minuteStepLocal as TimeSteps['minuteStep'] : 1, // value should be in range 1..59
    secondStep: 1 <= secondStepLocal && secondStepLocal <= 59 ? secondStepLocal as TimeSteps['secondStep'] : 1, // value should be in range 1..59
  };

  
  const getDefaultRangePickerValues = () =>
    Array.isArray(defaultValue) && defaultValue?.length === 2
      ? defaultValue?.map((v) => moment(new Date(v), format))
      : [null, null];

  const handleTimePickerChange = (newValue: Moment, timeString: string) => {
    if (onChange){
      const seconds = getTotalSeconds(newValue);
      (onChange as TimePickerChangeEvent)(seconds, timeString);
    }
  };
  const handleTimePickerSelect = (newValue: Moment) => {
    if (onChange){
      const seconds = getTotalSeconds(newValue);
      const timeString = seconds
        ? moment(seconds * 1000).format(format)
        : undefined;
      (onChange as TimePickerChangeEvent)(seconds, timeString);
    }
  };  

  const handleRangePicker = (values: Moment[], timeString: [string, string]) => {
    if (onChange){
      const seconds = values?.map(value => getTotalSeconds(value));

      (onChange as RangePickerChangeEvent)(seconds, timeString);
    }
  };

  if (readOnly) {
    return <ReadOnlyDisplayFormItem value={evaluatedValue} disabled={disabled} type="time" timeFormat={format} />;
  }

  if (range) {
    return (
      <TimeRangePicker
        bordered={!hideBorder}
        onChange={handleRangePicker}
        format={format}
        value={getDefaultRangePickerValues() as RangeValue}
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
      onSelect={handleTimePickerSelect}
      format={format}
      value={evaluatedValue|| (defaultValue && moment(defaultValue))}
      {...steps}
      style={getStyle(style, formData)}
      className="sha-timepicker"
      placeholder={placeholder}
      {...rest}
    />
  );
};