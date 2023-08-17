import { IToolboxComponent } from 'interfaces';
import { FormMarkup, IConfigurableFormComponent } from 'providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from 'providers/form/utils';
import { useForm } from 'providers';
import ReferenceListAutocomplete from '../../../referenceListAutocomplete';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

export interface IReferenceListAutocompleteProps extends IConfigurableFormComponent {
}

const settingsForm = settingsFormJson as FormMarkup;

const ReferenceListAutocompleteComponent: IToolboxComponent<IReferenceListAutocompleteProps> = {
  type: 'referenceListAutocomplete',
  name: 'Reference List Autocomplete',
  icon: <FileSearchOutlined />,
  isHidden: false,
  factory: (model: IReferenceListAutocompleteProps) => {
    const { formMode } = useForm();

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <ReferenceListAutocomplete readOnly={formMode === 'readonly'} value={value} onChange={onChange}/>}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m
    .add<IReferenceListAutocompleteProps>(0, prev => ({ ...prev, convertToFullId: true }))
    .add<IReferenceListAutocompleteProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default ReferenceListAutocompleteComponent;
