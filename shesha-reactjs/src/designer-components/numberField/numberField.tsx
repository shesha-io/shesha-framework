import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { useEntityProperties } from '@/hooks';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useGlobalState } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getDataProperty } from '@/utils/metadata';
import { getNumberFormat } from '@/utils/string';
import { NumberOutlined } from '@ant-design/icons';
import React from 'react';
import NumberFieldControl from './control';
import { INumberFieldComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';


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


   const properties= useEntityProperties({dataType:model.type})

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
              type="number"
              value={getNumberFormat(value, getDataProperty(properties, model.propertyName))}
            />
          ) : (
            <NumberFieldControl form={form} disabled={model.readOnly} model={model} value={value} onChange={onChange} />
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
    .add<INumberFieldComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<INumberFieldComponentProps>(2, (prev) => migrateReadOnly(prev))
  ,
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