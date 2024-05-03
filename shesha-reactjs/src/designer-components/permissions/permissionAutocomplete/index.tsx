import React from 'react';
import { SecurityScanOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import { IConfigurableFormComponent, IToolboxComponent } from '@/index';

export interface PermissionAutocompleteComponentProps extends IConfigurableFormComponent {
  
}

const PermissionAutocompleteComponent: IToolboxComponent<PermissionAutocompleteComponentProps> = {
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <SecurityScanOutlined />,
  type: 'permissionAutocomplete',
  name: 'Permission Autocomplete',
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model} >
        {(value, onChange) => <PermissionAutocomplete value={value} onChange={onChange} />}
      </ConfigurableFormItem>
    );
  },
};

export default PermissionAutocompleteComponent;
