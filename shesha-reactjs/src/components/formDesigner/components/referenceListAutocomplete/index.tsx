import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ReferenceListAutocomplete from '@/components/referenceListAutocomplete';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';

export interface IReferenceListAutocompleteProps extends IConfigurableFormComponent {
}

const settingsForm = settingsFormJson as FormMarkup;

const ReferenceListAutocompleteComponent: IToolboxComponent<IReferenceListAutocompleteProps> = {
  type: 'referenceListAutocomplete',
  name: 'Reference List Autocomplete',
  icon: <FileSearchOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <ReferenceListAutocomplete readOnly={model.readOnly} value={value} onChange={onChange}/>}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m
    .add<IReferenceListAutocompleteProps>(0, prev => ({ ...prev, convertToFullId: true }))
    .add<IReferenceListAutocompleteProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IReferenceListAutocompleteProps>(2, (prev) => migrateReadOnly(prev))
  ,
};

export default ReferenceListAutocompleteComponent;
