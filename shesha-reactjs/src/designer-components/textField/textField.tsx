import { CodeOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import { InputProps } from 'antd/lib/input';
import moment from 'moment';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { customEventHandler } from '@/components/formDesigner/components/utils';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { axiosHttp } from '@/utils/fetchers';
import { ITextFieldComponentProps, TextType } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem/index';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const settingsForm = settingsFormJson as FormMarkup;

const renderInput = (type: TextType) => {
  switch (type) {
    case 'password':
      return Input.Password;
    default:
      return Input;
  }
};

const TextFieldComponent: IToolboxComponent<ITextFieldComponentProps> = {
  type: 'textField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Text field',
  icon: <CodeOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string &&
    (dataFormat === StringFormats.singleline ||
      dataFormat === StringFormats.emailAddress ||
      dataFormat === StringFormats.phoneNumber ||
      dataFormat === StringFormats.password),
  Factory: ({ model }) => {
    const form = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const InputComponentType = renderInput(model.textType);

    const inputProps: InputProps = {
      className: 'sha-input',
      placeholder: model.placeholder,
      prefix: model.prefix,
      suffix: model.suffix,
      variant: model.hideBorder ? 'borderless' : undefined,
      maxLength: model.validate?.maxLength,
      size: model.size,
      disabled: model.readOnly,
      readOnly: model.readOnly,
      style: getStyle(model?.style, formData),
    };

    const eventProps = {
      model,
      form: getFormApi(form),
      formData,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setGlobalState,
    };

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={
          (model.passEmptyStringByDefault && '') ||
          (model.initialValue ? evaluateString(model.initialValue, { formData, formMode: form.formMode, globalState }) : undefined)
        }
      >
        {(value, onChange) => {
          const customEvent =  customEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0]);
            if (typeof onChange === 'function') 
              onChange(...args);
          };
          return inputProps.readOnly
            ? <ReadOnlyDisplayFormItem value={model.textType === 'password' ? ''.padStart(value.length, '•') : value} disabled={model.readOnly} />
            : <InputComponentType {...inputProps} {...customEvent} disabled={model.readOnly} value={value} onChange={onChangeInternal} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model) => ({
    textType: 'text',
    ...model,
  }),
  migrator: (m) => m
    .add<ITextFieldComponentProps>(0, (prev) => ({ ...prev, textType: 'text' }))
    .add<ITextFieldComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ITextFieldComponentProps>(2, (prev) => migrateVisibility(prev))
    .add<ITextFieldComponentProps>(3, (prev) => migrateReadOnly(prev))
    .add<ITextFieldComponentProps>(4, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
  ,
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => {
    return {
      ...model,
      textType: metadata.dataFormat === StringFormats.password ? 'password' : 'text',
    };
  },
};

export default TextFieldComponent;
