import { BaseWidget, BasicConfig, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import { CustomFieldSettings } from '@/providers/queryBuilder/models';
import React from 'react';
import { Dropdown } from '@/components/dropdown/dropdown';

export type RefListDropdownWidgetType = BaseWidget & SelectFieldSettings;
const RefListDropdownWidget: RefListDropdownWidgetType = {
  ...BasicConfig.widgets.select,
  jsType: 'number',
  type: 'refList',
  factory: props => {
    const { fieldDefinition, value, setValue } = props;
    const customSettings = fieldDefinition.fieldSettings as CustomFieldSettings;

    const onChange = v => {
      setValue(v);
    };

    return (
      <Dropdown
        dataSourceType='referenceList'
        referenceListId={{ module: customSettings.referenceListModule, name: customSettings.referenceListName }}
        value={value}
        onChange={onChange}
        style={{ minWidth: '150px' }}
        size="small"
      />
    );
  },
};

export default RefListDropdownWidget;
