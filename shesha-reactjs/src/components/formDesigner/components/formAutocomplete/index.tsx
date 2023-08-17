import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import FormAutocomplete from '../../../formAutocomplete';
import { IFormAutocompleteComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const FormAutocompleteComponent: IToolboxComponent<IFormAutocompleteComponentProps> = {
  type: 'formAutocomplete',
  name: 'Form Autocomplete',
  icon: <FileSearchOutlined />,
  isHidden: true,
  canBeJsSetting: true,
  factory: (model: IFormAutocompleteComponentProps) => {
    const { formMode } = useForm();

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => 
          <FormAutocomplete
            readOnly={formMode === 'readonly'}
            convertToFullId={model.convertToFullId}
            value={value}
            onChange={onChange}
          />}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m
    .add<IFormAutocompleteComponentProps>(0, prev => ({ ...prev, convertToFullId: true }))
    .add<IFormAutocompleteComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default FormAutocompleteComponent;
