import { BaseWidget, BasicConfig, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import { CustomFieldSettings } from '@/providers/queryBuilder/models';
import React from 'react';
import { RefListSimpleDropdown } from './simpleDropdown';

export type RefListDropdownWidgetType = BaseWidget & SelectFieldSettings;
const RefListDropdownWidget: RefListDropdownWidgetType = {
  ...BasicConfig.widgets.select,
  jsType: 'number',
  type: 'refList',
  factory: (props) => {
    const { fieldDefinition, value, setValue, readonly } = props;
    const customSettings = fieldDefinition.fieldSettings as CustomFieldSettings;

    const onChange = (v): void => {
      setValue(v);
    };

    return (
      <RefListSimpleDropdown
        onChange={onChange}
        referenceListId={{ module: customSettings.referenceListModule, name: customSettings.referenceListName }}
        style={{ minWidth: '150px' }}
        size="small"
        value={value}
        readOnly={readonly}
      />
    );
  },
};

export default RefListDropdownWidget;
