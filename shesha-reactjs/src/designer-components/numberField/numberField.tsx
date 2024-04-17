import { NumberOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
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
    const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
    const properties = asPropertiesArray(metaProperties, []);

    const { formMode, formData } = useForm();
    const { globalState } = useGlobalState();

    const [dataFormat, setDataFormat] = React.useState<string>('');
    useEffect(() => {
    (async () => {
       const data = await getDataProperty(properties, model?.propertyName, metaProperties);
       setDataFormat(data);
    })();
  }, [dataFormat]);

    return (
      <ConfigurableFormItem
        model={model}
        initialValue={evaluateString(model?.defaultValue, { formData, formMode, globalState })}
      >
        {(value, onChange) => {
          return model.readOnly ? (
            <ReadOnlyDisplayFormItem
              type="number"
              value={getNumberFormat(value, dataFormat)}
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
