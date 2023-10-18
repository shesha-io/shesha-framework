import { NumberOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '../../components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '../../interfaces';
import { DataTypes } from '../../interfaces/dataTypes';
import { useForm, useGlobalState, useMetaProperties } from '../../providers';
import { FormMarkup } from '../../providers/form/models';
import { evaluateString, validateConfigurableComponentSettings } from '../../providers/form/utils';
import NumberFieldControl from './control';
import { INumberFieldComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions } from '../../designer-components/_common-migrations/migrateSettings';
import { getNumberFormat } from 'utils/string';
import { getPropertyMetadata } from 'utils/date';

const settingsForm = settingsFormJson as FormMarkup;

const NumberFieldComponent: IToolboxComponent<INumberFieldComponentProps> = {
  type: 'numberField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  factory: (model: INumberFieldComponentProps, _c, form) => {
    const properties = useMetaProperties(['number']);
    const { formMode, isComponentDisabled, formData } = useForm();
    const { globalState } = useGlobalState();

    const isReadOnly = model?.readOnly || formMode === 'readonly';

    const disabled = isComponentDisabled(model);

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={evaluateString(model?.defaultValue, { formData, formMode, globalState })}
      >
        {(value, onChange) => {
          return isReadOnly ? (
            <ReadOnlyDisplayFormItem disabled={disabled} value={getNumberFormat(value, getPropertyMetadata(properties, model.propertyName))}/>
          ) : (
            <NumberFieldControl form={form} disabled={disabled} model={model} value={value} onChange={onChange} />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  initModel: (model) => ({
    ...model,
  }),
  migrator: (m) => m
    .add<INumberFieldComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
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
