import React from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup } from '../../../../../providers/form/models';
import { TagOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../../formItem';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';
import { DataTypes } from '../../../../../interfaces/dataTypes';
import AutocompleteTagGroup from '../../../../autocompleteTagGroup';
import { useForm } from '../../../../..';
import { IAutocompleteTagsOutlinedComponentProps } from '../../autocompleteTagGroup';

const settingsForm = settingsFormJson as FormMarkup;

const PermissionTagGroupComponent: IToolboxComponent<IAutocompleteTagsOutlinedComponentProps> = {
  type: 'permissionTagGroup',
  name: 'Permission Tag Group',
  icon: <TagOutlined />,
  initModel: model => {
    const customProps: IAutocompleteTagsOutlinedComponentProps = {
      ...model,
      autocompleteUrl: "/api/services/app/permission/autocomplete"
    };
    return customProps;
  },
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  factory: (model: IAutocompleteTagsOutlinedComponentProps) => {

    const { formMode } = useForm();

    return (
      <ConfigurableFormItem model={model}>
        <AutocompleteTagGroup 
          value={model?.value} 
          defaultValue={model?.defaultValue} 
          onChange={model?.onChange}
          autocompleteUrl={model?.autocompleteUrl || "/api/services/app/permission/autocomplete"} 
          readOnly={model?.readOnly || formMode === 'readonly'}
          disabled={model?.disabled}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default PermissionTagGroupComponent;
