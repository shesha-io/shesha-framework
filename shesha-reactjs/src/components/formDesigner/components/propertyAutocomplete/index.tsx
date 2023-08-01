import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { PropertyAutocomplete } from '../../../propertyAutocomplete/propertyAutocomplete';
import { evaluateString, MetadataProvider, useForm, useFormData } from '../../../..';
import ConditionalWrap from '../../../conditionalWrapper';
import { IPropertyAutocompleteComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const PropertyAutocompleteComponent: IToolboxComponent<IPropertyAutocompleteComponentProps> = {
  type: 'propertyAutocomplete',
  name: 'Property Autocomplete',
  icon: <FileSearchOutlined />,
  factory: (model: IPropertyAutocompleteComponentProps) => {
    const { formMode } = useForm();
    const { data: formData } = useFormData();
    const { modelType: modelTypeExpression } = model;

    const modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : null;

    return (
      <ConditionalWrap
        condition={Boolean(modelType)}
        wrap={content => <MetadataProvider modelType={modelType}>{content}</MetadataProvider>}
      >
        <ConfigurableFormItem model={model}>
          {(value, onChange) => {
            return (
              <PropertyAutocomplete
                id={model.id}
                style={getStyle(model?.style, formData)}
                dropdownStyle={getStyle(model?.dropdownStyle, formData)}
                size={model.size}
                mode={model.mode}
                readOnly={formMode === 'readonly'}
                showFillPropsButton={model.showFillPropsButton ?? true}
                value={value}
                onChange={onChange}
              />
            );
          }}
        </ConfigurableFormItem>
      </ConditionalWrap>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IPropertyAutocompleteComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
};

export default PropertyAutocompleteComponent;
