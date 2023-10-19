import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { ApiOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { evaluateValue, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData } from '../../../../providers';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { EndpointsAutocomplete } from '../../../endpointsAutocomplete/endpointsAutocomplete';
import { IEndpointsAutocompleteComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from '../../../../designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const EndpointsAutocompleteComponent: IToolboxComponent<IEndpointsAutocompleteComponentProps> = {
  type: 'endpointsAutocomplete',
  name: 'API Endpoints Autocomplete',
  icon: <ApiOutlined />,
  isHidden: true,
  canBeJsSetting: true,
  factory: (model: IEndpointsAutocompleteComponentProps, _c, _form) => {
    const { formMode, isComponentDisabled } = useForm();
    const { data: formData } = useFormData();

    const disabled = isComponentDisabled(model);

    const readOnly = disabled || model?.readOnly || formMode === 'readonly';
    const verb = model.httpVerb ? evaluateValue(model.httpVerb, { data: formData }) : model.httpVerb;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return readOnly ? (
              <ReadOnlyDisplayFormItem disabled={disabled} value={value} />
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
  ,  
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default EndpointsAutocompleteComponent;
