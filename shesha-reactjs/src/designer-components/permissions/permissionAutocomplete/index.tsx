import React from 'react';
import { SecurityScanOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components';
import { PermissionAutocomplete } from '@/components/permissionAutocomplete';
import { FormMarkup } from '@/index';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import settingsFormJson from './settingsForm.json';
import { IPermissionAutocompleteComponentProps, PermissionAutocompleteComponentDefinition } from './interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const PermissionAutocompleteComponent: PermissionAutocompleteComponentDefinition = {
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  icon: <SecurityScanOutlined />,
  type: 'permissionAutocomplete',
  name: 'Permission Autocomplete',
  Factory: ({ model }) => {
    if (model.hidden) return null;
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <PermissionAutocomplete value={value} onChange={onChange} readOnly={model.readOnly} />}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  migrator: (m) => m
    .add<IPermissionAutocompleteComponentProps>(0, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
};

export default PermissionAutocompleteComponent;
