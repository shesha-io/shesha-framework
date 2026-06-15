import { BasicConfig, NumberWidget, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import { CustomFieldSettings } from '@/providers/queryBuilder/models';
import React from 'react';
import { RefListSimpleDropdown } from './simpleDropdown';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export type RefListDropdownWidgetType = NumberWidget & SelectFieldSettings;
const RefListDropdownWidget: RefListDropdownWidgetType = {
  ...BasicConfig.widgets.select,
  jsType: 'number',
  type: 'refList',
  factory: (props) => {
    const { fieldDefinition, value, setValue, readonly } = props;
    const customSettings = fieldDefinition.fieldSettings as CustomFieldSettings;

    return !isNullOrWhiteSpace(customSettings.referenceListModule) && !isNullOrWhiteSpace(customSettings.referenceListName)
      ? (
        <RefListSimpleDropdown
          onChange={(newValue) => {
            setValue(newValue);
          }}
          referenceListId={{ module: customSettings.referenceListModule, name: customSettings.referenceListName }}
          style={{ minWidth: '150px' }}
          size="small"
          value={value && !Array.isArray(value) ? value : undefined}
          readOnly={readonly}
        />
      )
      : <></>;
  },
};

export default RefListDropdownWidget;
