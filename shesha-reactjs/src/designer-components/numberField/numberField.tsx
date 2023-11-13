import { NumberOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from 'components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from 'components/readOnlyDisplayFormItem';
import { IToolboxComponent } from 'interfaces';
import { DataTypes } from 'interfaces/dataTypes';
import { useForm, useGlobalState, useMetadata } from 'providers';
import { FormMarkup } from 'providers/form/models';
import { evaluateString, validateConfigurableComponentSettings } from 'providers/form/utils';
import NumberFieldControl from './control';
import { INumberFieldComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';
import { getNumberFormat } from 'utils/string';
import { getDataFormat } from 'utils/metadata';

const settingsForm = settingsFormJson as FormMarkup;

const NumberFieldComponent: IToolboxComponent<INumberFieldComponentProps> = {
  type: 'numberField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  Factory: ({ model, form }) => {
    const { properties = [] } = useMetadata(false)?.metadata ?? {};
    const { formMode, formData } = useForm();
    const { globalState } = useGlobalState();

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={evaluateString(model?.defaultValue, { formData, formMode, globalState })}
      >
        {(value, onChange) => {
          return model.readOnly ? (
            <ReadOnlyDisplayFormItem
              disabled={model.disabled}
              type="number"
              value={getNumberFormat(value, getDataFormat(properties, model.propertyName))}
            />
          ) : (
            <NumberFieldControl form={form} disabled={model.disabled} model={model} value={value} onChange={onChange} />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  initModel: (model) => ({
    ...model,
  }),
  migrator: (m) => m.add<INumberFieldComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev))),
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
