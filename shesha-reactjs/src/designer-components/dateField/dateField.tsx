import { CalendarOutlined } from '@ant-design/icons';
import { message } from 'antd';
import moment from 'moment';
import React, { Fragment, useEffect } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customDateEventHandler } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useMetadata, useSheshaApplication } from '@/providers';
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
import { getDataProperty } from '@/utils';
import { asPropertiesArray } from '@/interfaces/metadata';

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

    const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);
    
    const [dateFormat, setDateFormat] = React.useState<string>(model?.dateFormat || DATE_TIME_FORMATS.date);
                
    useEffect(() => {
      const getDateFormat = async () => {
        try {
          const response = await getDataProperty(properties, model?.propertyName, metaProperties);
        setDateFormat(response ? response : dateFormat);
        console.log(model.propertyName, ' Date field response: ', response)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if(!model?.dateFormat){
      getDateFormat();
    }
    
  }, [dateFormat, model]);

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
            
            return <DatePickerWrapper {...model} {...customEvent} value={value} onChange={onChangeInternal} dateFormat={dateFormat}/>;
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