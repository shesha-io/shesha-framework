import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { CodeOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import { InputProps } from 'antd/lib/input';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData, useGlobalState, useSheshaApplication } from '../../../../providers';
import { customEventHandler } from '../utils';
import { DataTypes, StringFormats } from '../../../../interfaces/dataTypes';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { axiosHttp } from '../../../../utils/fetchers';
import moment from 'moment';
import { ITextFieldComponentProps, TextType } from './interfaces';

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
  name: 'Text field',
  icon: <CodeOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string &&
    (dataFormat === StringFormats.singleline ||
      dataFormat === StringFormats.emailAddress ||
      dataFormat === StringFormats.phoneNumber ||
      dataFormat === StringFormats.password),
  factory: (model: ITextFieldComponentProps, _c, form) => {
    const { formMode, isComponentDisabled, setFormDataAndInstance } = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const disabled = isComponentDisabled(model);

    //console.log('LOGS:: model?.readOnly', model?.readOnly, model?.type, model);

    const readOnly = model?.readOnly || (formMode === 'readonly' && model.textType !== 'password');

    const inputProps: InputProps = {
      placeholder: model.placeholder,
      prefix: model.prefix,
      suffix: model.suffix,
      bordered: !model.hideBorder,
      maxLength: model.validate?.maxLength,
      size: model?.size,
      disabled,
      readOnly,
      style: getStyle(model?.style, formData),
    };

    const InputComponentType = renderInput(model.textType);

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
        {readOnly ? (
          <ReadOnlyDisplayFormItem disabled={disabled} />
        ) : (
          <InputComponentType {...inputProps} disabled={disabled} {...customEventHandler(eventProps)} />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => ({
    textType: 'text',
    ...model,
  }),
  migrator: m => m.add<ITextFieldComponentProps>(0, prev => ({ ...prev, textType: 'text' })),
  linkToModelMetadata: (model, metadata): ITextFieldComponentProps => {
    return {
      ...model,
      textType: metadata.dataFormat === StringFormats.password ? 'password' : 'text',
    };
  },
};

export default TextFieldComponent;
