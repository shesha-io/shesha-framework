import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { TagOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { DataTypes } from '../../../../interfaces/dataTypes';
import AutocompleteTagGroup from '../../../autocompleteTagGroup';
import { useForm } from '../../../..';

export interface IAutocompleteTagsOutlinedComponentProps extends IConfigurableFormComponent {
  value?: string[];
  defaultValue?: string;
  autocompleteUrl: string;
  onChange?: (values?: string[]) => void;
  /**
  * Whether this control is disabled
  */
   disabled?: boolean;
  /**
  * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
  */
  readOnly?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const AutocompleteTagGroupComponent: IToolboxComponent<IAutocompleteTagsOutlinedComponentProps> = {
  type: 'autocompleteTagGroup',
  name: 'AutocompleteTagsOutlined',
  icon: <TagOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  factory: (model: IAutocompleteTagsOutlinedComponentProps) => {

    const { formMode } = useForm();

    return (
      <ConfigurableFormItem model={model}>
        <AutocompleteTagGroup 
          value={model?.value} 
          defaultValue={model?.defaultValue} 
          onChange={model?.onChange}
          autocompleteUrl={model?.autocompleteUrl} 
          readOnly={model?.readOnly || formMode === 'readonly'}
          disabled={model?.disabled}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default AutocompleteTagGroupComponent;
