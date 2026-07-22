import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import React from 'react';
import settingsFormJson from './settingsForm.json';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { FileSearchOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { IPropertyAutocompleteComponentProps, PropertyAutocompleteComponentDefinition } from './interfaces';
import { ConditionalMetadataProvider } from '@/providers';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { getBooleanPropertyOrUndefined } from '@/utils/object';

const settingsForm = settingsFormJson as FormMarkup;

export const PropertyAutocompleteComponent: PropertyAutocompleteComponentDefinition = {
  type: 'propertyAutocomplete',
  name: 'Property Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  preserveDimensionsInDesigner: true,
  calculateModel: (model, allData) => ({
    modelType: typeof model.modelType === 'string' ? evaluateString(model.modelType, { data: allData.data }) : model.modelType,
    dropdownStyle: getStyle(model.dropdownStyle, allData.data),
  }),
  Factory: ({ model, calculatedModel }) => {
    const modelType = calculatedModel.modelType;

    return (
      <ConditionalMetadataProvider modelType={modelType}>
        <ConfigurableFormItem<string | string[]> model={model}>
          {(value, onChange) => {
            return (
              <PropertyAutocomplete
                style={model.allStyles?.fullStyle}
                dropdownStyle={calculatedModel.dropdownStyle}
                size={model.size}
                mode={model.mode}
                readOnly={model.readOnly}
                autoFillProps={model.autoFillProps ?? true}
                value={value ?? undefined}
                onChange={onChange}
                propertyModelType={model.propertyModelType}
              />
            );
          }}
        </ConfigurableFormItem>
      </ConditionalMetadataProvider>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IPropertyAutocompleteComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPropertyAutocompleteComponentProps>(1, (prev) => migrateReadOnly(prev))
    .add<IPropertyAutocompleteComponentProps>(2, (prev) => {
      const showFillPropsButton = getBooleanPropertyOrUndefined(prev, 'showFillPropsButton');
      if (typeof showFillPropsButton !== 'undefined') {
        return { ...prev, autoFillProps: showFillPropsButton };
      } else {
        return { ...prev };
      }
    }),
};

