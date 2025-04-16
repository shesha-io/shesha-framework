import ConditionalWrap from '@/components/conditionalWrapper';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import settingsFormJson from './settingsForm.json';
import { evaluateString } from '@/providers/form/utils';
import { FileSearchOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IPropertyAutocompleteComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { MetadataProvider, useFormData } from '@/providers';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';

const settingsForm = settingsFormJson as FormMarkup;

export const PropertyAutocompleteComponent: IToolboxComponent<IPropertyAutocompleteComponentProps> = {
  type: 'propertyAutocomplete',
  name: 'Property Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { modelType: modelTypeExpression } = model;

    let modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : null;


    if (typeof formData?.entityTypeShortAlias == 'object' && formData.entityTypeShortAlias.hasOwnProperty('_code')) {

      modelType = new Function('data', formData?.entityTypeShortAlias?._code)({ data: formData });
    }
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
                readOnly={model.readOnly}
                autoFillProps={model.autoFillProps ?? true}
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
    .add<IPropertyAutocompleteComponentProps>(1, (prev) => migrateReadOnly(prev))
    .add<IPropertyAutocompleteComponentProps>(2, (prev) => {
      const showFillPropsButton = prev['showFillPropsButton'];
      if (typeof showFillPropsButton !== 'undefined') {
        return { ...prev, autoFillProps: showFillPropsButton };
      } else {
        return { ...prev };
      }
    })
  ,
};

