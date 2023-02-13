import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { NumberOutlined } from '@ant-design/icons';
import { InputNumber, InputNumberProps, message } from 'antd';
import ConfigurableFormItem from '../formItem';
import { INumberFieldProps } from './models';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { useForm, useGlobalState, useSheshaApplication } from '../../../../providers';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { customInputNumberEventHandler } from '../utils';
import { axiosHttp } from '../../../../apis/axios';
import moment from 'moment';
import FormItemWrapper from '../formItemWrapper';

const settingsForm = settingsFormJson as FormMarkup;

const NumberField: IToolboxComponent<INumberFieldProps> = {
  type: 'numberField',
  name: 'Number field',
  icon: <NumberOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  factory: (model: INumberFieldProps, _c, form) => {
    const { formMode, isComponentDisabled, formData, setFormDataAndInstance } = useForm();
    const { globalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const isReadOnly = model?.readOnly || formMode === 'readonly';

    const disabled = isComponentDisabled(model);

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
    };

    const renderInputNumber = () => {
      const inputProps: InputNumberProps = {
        disabled: disabled,
        bordered: !model.hideBorder,
        min: model?.min,
        max: model?.max,
        size: model?.size,
        style: getStyle(model?.style, formData),
        step: model?.highPrecision ? model?.stepNumeric : model?.stepNumeric,
        ...customInputNumberEventHandler(eventProps),
        defaultValue: model?.defaultValue,
      };

      return <InputNumber {...inputProps} stringMode={model?.highPrecision} />;
    };

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={evaluateString(model?.defaultValue, { formData, formMode, globalState })}
      >
        <FormItemWrapper mutate={isReadOnly} formType="number">
          {isReadOnly ? <ReadOnlyDisplayFormItem disabled={disabled} /> : renderInputNumber()}
        </FormItemWrapper>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  initModel: model => ({
    ...model,
  }),
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  linkToModelMetadata: (model, metadata): INumberFieldProps => {
    return {
      ...model,
      label: metadata.label,
      description: metadata.description,
      min: metadata.min,
      max: metadata.max,
      // todo: add decimal points and format
    };
  },
};

export default NumberField;
