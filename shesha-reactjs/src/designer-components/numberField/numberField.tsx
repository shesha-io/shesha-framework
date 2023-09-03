import { NumberOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import FormItemWrapper from '../../components/formDesigner/components/formItemWrapper';
import ReadOnlyDisplayFormItem from '../../components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '../../interfaces';
import { DataTypes } from '../../interfaces/dataTypes';
import { useForm, useGlobalState } from '../../providers';
import { FormMarkup } from '../../providers/form/models';
import { evaluateString, validateConfigurableComponentSettings } from '../../providers/form/utils';
import NumberFieldControl from './control';
import { INumberFieldComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';

const settingsForm = settingsFormJson as FormMarkup;

const NumberFieldComponent: IToolboxComponent<INumberFieldComponentProps> = {
  type: 'numberField',
  isInput: true,
  isOutput: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  factory: (model: INumberFieldComponentProps, _c, form) => {
    const { formMode, isComponentDisabled, formData } = useForm();
    const { globalState } = useGlobalState();

    const isReadOnly = model?.readOnly || formMode === 'readonly';

    const disabled = isComponentDisabled(model);

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={evaluateString(model?.defaultValue, { formData, formMode, globalState })}
      >
        <FormItemWrapper mutate={isReadOnly} formType="number">
          {isReadOnly ? (
            <ReadOnlyDisplayFormItem disabled={disabled} />
          ) : (
            <NumberFieldControl form={form} disabled={disabled} model={model} />
          )}
        </FormItemWrapper>
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  initModel: (model) => ({
    ...model,
  }),
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  linkToModelMetadata: (model, metadata): INumberFieldComponentProps => {
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

export default NumberFieldComponent;
