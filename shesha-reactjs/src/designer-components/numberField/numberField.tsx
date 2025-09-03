import { NumberOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useFormItem, useGlobalState, useMetadata } from '@/providers';
import { FormMarkup, IInputStyles } from '@/providers/form/models';
import { evaluateString, validateConfigurableComponentSettings, getFieldNameFromExpression } from '@/providers/form/utils';
import NumberFieldControl from './control';
import { INumberFieldComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { getNumberFormat } from '@/utils/string';
import { getDataProperty } from '@/utils/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { asPropertiesArray } from '@/interfaces/metadata';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

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

    const { formMode, formData, form, setFormData } = useForm();
    const { globalState } = useGlobalState();
    const formItem = useFormItem();
    const propName = formItem?.namePrefix && !model.initialContext
      ? formItem.namePrefix + '.' + model.propertyName
      : model.propertyName;
    const fieldName = getFieldNameFromExpression(propName);

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={model?.defaultValue ? evaluateString(model?.defaultValue, { formData, formMode, globalState }) : undefined}
        valuePropName="value"
      >
        {(value, onChange) => {
          // Ensure the field is set to 0 immediately if it's null, undefined, or false
          useEffect(() => {
            if (value == null || value === false) {
              // Use both onChange and form.setFieldValue to ensure the value is properly set
              onChange(0);
              if (form && fieldName) {
                form.setFieldValue(fieldName, 0);
              }
              // Also update the form data provider directly
              if (setFormData && propName) {
                setFormData({
                  values: { [propName]: 0 },
                  mergeValues: true
                });
              }
            }
          }, [value, onChange, form, fieldName, setFormData, propName]);

          // Coerce null/undefined/false values to 0
          const coercedValue = (value == null || value === false) ? 0 : value;
          
          return model.readOnly ? (
            <ReadOnlyDisplayFormItem
              type="number"
              value={getNumberFormat(coercedValue, getDataProperty(properties, model.propertyName))}
            />
          ) : (
            <NumberFieldControl disabled={model.readOnly} model={model} value={coercedValue} onChange={onChange} />
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
