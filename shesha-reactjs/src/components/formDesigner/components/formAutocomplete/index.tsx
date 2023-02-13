import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import FormAutocomplete from '../../../formAutocomplete';

export interface IFormAutocompleteProps extends IConfigurableFormComponent {
    convertToFullId: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const FormAutocompleteComponent: IToolboxComponent<IFormAutocompleteProps> = {
  type: 'formAutocomplete',
  name: 'Form Autocomplete',
  icon: <FileSearchOutlined />,
  isHidden: true,
  factory: (model: IFormAutocompleteProps) => {
    const { formMode } = useForm();

    return (
      <ConfigurableFormItem
        model={model}
      >
        <FormAutocomplete 
            readOnly={formMode === 'readonly'}
            convertToFullId={model.convertToFullId}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m.add<IFormAutocompleteProps>(0, prev => ({ ...prev, convertToFullId: true })),
};

export default FormAutocompleteComponent;
