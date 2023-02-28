import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import FormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { PropertyAutocomplete } from '../../../propertyAutocomplete/propertyAutocomplete';
import { evaluateString, MetadataProvider, useForm, useFormData } from '../../../..';
import ConditionalWrap from '../../../conditionalWrapper';

export interface IPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string;
  showFillPropsButton?: boolean;
}

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
        <FormItem model={model}>
          <PropertyAutocomplete
            id={model.id}
            style={getStyle(model?.style, formData)}
            dropdownStyle={getStyle(model?.dropdownStyle, formData)}
            size={model.size}
            mode={model.mode}
            readOnly={formMode === 'readonly'}
            showFillPropsButton={model.showFillPropsButton ?? true}
          />
        </FormItem>
      </ConditionalWrap>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default PropertyAutocompleteComponent;
