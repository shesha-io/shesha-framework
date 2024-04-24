import { CalendarOutlined } from '@ant-design/icons';
import { message } from 'antd';
import moment from 'moment';
import React, { Fragment } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customDateEventHandler } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import { IDateFieldProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import {
  DATE_TIME_FORMATS,
} from './utils';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { DatePickerWrapper } from './datePickerWrapper';
import { useEntityProperties } from '@/hooks';
import { getDataProperty } from '@/utils';

const settingsForm = settingsFormJson as FormMarkup;

const DateField: IToolboxComponent<IDateFieldProps> = {
  type: 'dateField',
  name: 'Date field',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <CalendarOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.date || dataType === DataTypes.dateTime,
  Factory: ({ model, form }) => {
    const { formMode, setFormData } = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();
    const properties = useEntityProperties({});


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

    const globalDateFormat = getDataProperty(properties, model.propertyName);
    

    return (
      <Fragment>
        <ConfigurableFormItem model={model}>
          {(value, onChange) => {
            const customEvent =  customDateEventHandler(eventProps);
            const onChangeInternal = (...args: any[]) => {
              customEvent.onChange(args[0], args[1]);
              if (typeof onChange === 'function') 
                onChange(...args);
            };
            
            return <DatePickerWrapper {...model} {...customEvent} value={value} onChange={onChangeInternal} dateFormat={model?.dateFormat||globalDateFormat} />;
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
    .add<IDateFieldProps>(1, (prev) => migrateVisibility(prev))
    .add<IDateFieldProps>(2, (prev) => migrateReadOnly(prev))
  ,
  linkToModelMetadata: (model, metadata): IDateFieldProps => {

    return {
      ...model,
      dateFormat: !!metadata.dataFormat ? metadata.dataFormat : model.dateFormat,
      showTime: metadata.dataType === DataTypes.date ? false : model.showTime,
    };
  },
};

export default DateField;