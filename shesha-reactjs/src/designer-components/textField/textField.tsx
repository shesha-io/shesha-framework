import { CodeOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import { InputProps } from 'antd/lib/input';
import moment from 'moment';
import React from 'react';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import { customEventHandler } from '../../components/formDesigner/components/utils';
import { IToolboxComponent } from '../../interfaces';
import { DataTypes, StringFormats } from '../../interfaces/dataTypes';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '../../providers';
import { FormMarkup } from '../../providers/form/models';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '../../providers/form/utils';
import { axiosHttp } from '../../utils/fetchers';
import { ITextFieldComponentProps, TextType } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migrateCustomFunctions, migratePropertyName } from '../../designer-components/_common-migrations/migrateSettings';
import ReadOnlyDisplayFormItem from 'components/readOnlyDisplayFormItem/index';

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
  Factory: ({ model, form }) => {
    const { formMode, setFormDataAndInstance } = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const InputComponentType = renderInput(model.textType);

    const inputProps: InputProps = {
      className: 'sha-input',
      placeholder: model.placeholder,
      prefix: model.prefix,
      suffix: model.suffix,
      bordered: !model.hideBorder,
      maxLength: model.validate?.maxLength,
      size: model.size,
      disabled: model.disabled,
      readOnly: model.readOnly,
      style: getStyle(model?.style, formData),
    };

    const eventProps = {
      model,
      form,
      formData,
      formMode,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setFormData: setFormDataAndInstance,
      setGlobalState,
    };

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={
          (model?.passEmptyStringByDefault && '') ||
          evaluateString(model?.initialValue, { formData, formMode, globalState })
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
            ? <ReadOnlyDisplayFormItem value={model.textType === 'password' ? ''.padStart(value.length, '•••••') : value} disabled={model.disabled} />
            : <InputComponentType {...inputProps} {...customEvent} disabled={model.disabled} value={value} onChange={onChangeInternal} />;
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
  ,
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => {
    return {
      ...model,
      textType: metadata.dataFormat === StringFormats.password ? 'password' : 'text',
    };
  },
};

export default TextFieldComponent;
