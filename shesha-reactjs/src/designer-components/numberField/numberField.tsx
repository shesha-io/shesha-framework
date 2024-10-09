import { NumberOutlined } from '@ant-design/icons';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useGlobalState, useMetadata } from '@/providers';
import { FormMarkup } from '@/providers/form/models';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import NumberFieldControl from './control';
import { INumberFieldComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { getNumberFormat } from '@/utils/string';
import { getDataProperty } from '@/utils/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { asPropertiesArray } from '@/interfaces/metadata';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IInputStyles } from '../textField/interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const NumberFieldComponent: IToolboxComponent<INumberFieldComponentProps> = {
  type: 'numberField',
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  name: 'Number field',
  icon: <NumberOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.number,
  Factory: ({ model }) => {
    const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);

    const { formMode, formData } = useForm();
    const { globalState } = useGlobalState();

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={model?.defaultValue ? evaluateString(model?.defaultValue, { formData, formMode, globalState }) : undefined}
      >
        {(value, onChange) => {
          return model.readOnly ? (
            <ReadOnlyDisplayFormItem
              type="number"
              value={getNumberFormat(value, getDataProperty(properties, model.propertyName))}
            />
          ) : (
            <NumberFieldControl disabled={model.readOnly} model={model} value={value} onChange={onChange} />
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
    .add<INumberFieldComponentProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
    .add<INumberFieldComponentProps>(4, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        stylingBox: prev.stylingBox,
        style: prev.style
      };

      return { ...prev, desktop: {...styles}, tablet: {...styles}, mobile: {...styles} };
    })
  ,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  linkToModelMetadata: (model, metadata): INumberFieldComponentProps => {
    return {
      ...model,
      label: metadata.label,
      description: metadata.description,
      min: metadata.min,
      max: metadata.max,
      // TODO: add decimal points and format
    };
  },
};

export default NumberFieldComponent;
