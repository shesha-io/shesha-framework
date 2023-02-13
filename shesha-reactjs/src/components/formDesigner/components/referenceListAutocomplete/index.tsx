import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FileSearchOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import ReferenceListAutocomplete from '../../../referenceListAutocomplete';

export interface IReferenceListAutocompleteProps extends IConfigurableFormComponent {
    convertToFullId: boolean;
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
      <ConfigurableFormItem
        model={model}
      >
        <ReferenceListAutocomplete 
            readOnly={formMode === 'readonly'}
            convertToFullId={model.convertToFullId}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  migrator: m => m.add<IReferenceListAutocompleteProps>(0, prev => ({ ...prev, convertToFullId: true })),
};

export default ReferenceListAutocompleteComponent;
