import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import moment from 'moment';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customTimeEventHandler } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { ITimePickerProps } from './models';
import { TimePickerWrapper } from './timePickerWrapper';
import { useEntityProperties } from '@/hooks';
import { getDataProperty } from '@/utils';

const DATE_TIME_FORMAT = 'HH:mm';

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
    const properties = useEntityProperties({dataType:model.type});

    
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

    const globalFormat = getDataProperty(properties, model.propertyName);

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) =>  {
          const customEvent =  customTimeEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0], args[1]);
            if (typeof onChange === 'function') 
              onChange(...args);
          };
          return <TimePickerWrapper {...model} {...customEvent} value={value} onChange={onChangeInternal} format={model?.format||globalFormat} />;
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
  linkToModelMetadata: (model, metadata): ITimePickerProps => {

    return {
      ...model,
      format: metadata.dataFormat ? metadata.dataFormat : DATE_TIME_FORMAT,
    };
  },
};