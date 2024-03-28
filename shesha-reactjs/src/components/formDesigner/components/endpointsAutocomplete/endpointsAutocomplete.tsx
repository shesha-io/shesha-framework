import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { ApiOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { evaluateValue, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useFormData } from '@/providers';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { EndpointsAutocomplete } from '../../../endpointsAutocomplete/endpointsAutocomplete';
import { IEndpointsAutocompleteComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

const settingsForm = settingsFormJson as FormMarkup;

const EndpointsAutocompleteComponent: IToolboxComponent<IEndpointsAutocompleteComponentProps> = {
  type: 'endpointsAutocomplete',
  name: 'API Endpoints Autocomplete',
  icon: <ApiOutlined />,
  isInput: true,
  isOutput: true,
  isHidden: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const verb = model.httpVerb ? evaluateValue(model.httpVerb, { data: formData }) : model.httpVerb;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return model.readOnly ? (
              <ReadOnlyDisplayFormItem value={value} />
            ) : (
              <EndpointsAutocomplete {...model} httpVerb={verb} value={value} onChange={onChange} />
            );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  migrator: (m) => m
    .add<IEndpointsAutocompleteComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IEndpointsAutocompleteComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IEndpointsAutocompleteComponentProps>(2, (prev) => migrateReadOnly(prev))
  ,  
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default EndpointsAutocompleteComponent;
