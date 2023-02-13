import { BaseWidget, BasicConfig, SelectFieldSettings } from 'react-awesome-query-builder';
import { CustomFieldSettings } from '../../../../providers/queryBuilder/models';
import RefListDropDown from '../../../refListDropDown';
import React from 'react';

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
      <RefListDropDown.Raw
        referenceListId={{ module: customSettings.referenceListModule, name: customSettings.referenceListName }}
        value={value}
        onChange={onChange}
        style={{ minWidth: '150px' }}
        size="small"
        showArrow={true}
      />
    );
  },
};

export default RefListDropdownWidget;
