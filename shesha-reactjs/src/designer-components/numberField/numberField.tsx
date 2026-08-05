import { NumberOutlined } from '@ant-design/icons';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IToolboxComponent } from '@/interfaces';
import { DataTypes } from '@/interfaces/dataTypes';
import { useForm, useGlobalState, useMetadata, useShaFormInstance } from '@/providers';
import { FormMarkup, IInputStyles } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import NumberFieldControl from './control';
import { isEmptyValue, resolveDefaultValue } from './utils';
import { INumberFieldComponentProps, NumberFieldValue } from './interfaces';
import settingsFormJson from './settingsForm.json';
import { migratePropertyName, migrateCustomFunctions, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { getNumberFormat } from '@/utils/string';
import { getDataProperty } from '@/utils/metadata';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { asPropertiesArray } from '@/interfaces/metadata';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const settingsForm = settingsFormJson as FormMarkup;

interface INumberFieldEditorProps {
  model: INumberFieldComponentProps;
  value: NumberFieldValue;
  onChange: (value: NumberFieldValue) => void;
  defaultValue: NumberFieldValue;
  canApplyDefaultValue: boolean;
}

/**
 * Editable number input that makes sure the configured default value ends up in the form data.
 *
 * `Form.Item`'s `initialValue` writes straight into antd's internal store without raising
 * `onValuesChange`, and `onValuesChange` is the only thing that syncs values into `shaForm.formData` -
 * the object that gets submitted. On top of that, loading a details form calls `resetFields()` +
 * `setFieldsValue(loadedData)`, which overwrites the seeded value with the entity's `null`.
 * Writing the default through `onChange` keeps antd's store, the form data and the UI in agreement.
 */
const NumberFieldEditor: FC<INumberFieldEditorProps> = ({ model, value, onChange, defaultValue, canApplyDefaultValue }) => {
  // guards against re-applying the default after the user (or a script) deliberately clears the field
  const defaultValueApplied = useRef(false);

  useEffect(() => {
    if (defaultValueApplied.current || !canApplyDefaultValue) return;

    // only evaluated once the form data has settled, otherwise the value loaded from the server would
    // overwrite the default we just applied
    defaultValueApplied.current = true;

    if (!isEmptyValue(defaultValue) && isEmptyValue(value)) onChange(defaultValue);
  }, [canApplyDefaultValue, defaultValue, value, onChange]);

  return <NumberFieldControl disabled={model.readOnly} model={model} value={value} onChange={onChange} />;
};

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
    const shaForm = useShaFormInstance(false);

    const defaultValue = useMemo(
      () => resolveDefaultValue(model?.defaultValue, { formData, formMode, globalState }, model?.highPrecision),
      [model?.defaultValue, model?.highPrecision, formData, formMode, globalState]
    );

    // don't touch the data while it's still being fetched, and never while designing the form
    const canApplyDefaultValue = formMode === 'edit'
      && (shaForm?.dataLoadingState?.status ?? 'ready') === 'ready';

    return (
      <ConfigurableFormItem model={model} initialValue={defaultValue}>
        {(value, onChange) => {
          return model.readOnly ? (
            <ReadOnlyDisplayFormItem
              type="number"
              value={getNumberFormat(value, getDataProperty(properties, model.propertyName))}
            />
          ) : (
            <NumberFieldEditor
              model={model}
              value={value}
              onChange={onChange}
              defaultValue={defaultValue}
              canApplyDefaultValue={canApplyDefaultValue}
            />
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
