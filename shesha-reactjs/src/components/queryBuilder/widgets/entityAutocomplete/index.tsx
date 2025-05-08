import React from 'react';
import { BaseWidget, BasicConfig, SelectFieldSettings } from '@react-awesome-query-builder/antd';
import { Autocomplete } from '@/components/autocomplete';
import { CustomFieldSettings } from '@/providers/queryBuilder/models';
import { getValueByPropertyName } from '@/utils/object';

export type EntityAutocompleteWidgetType = BaseWidget & SelectFieldSettings;
const EntityAutocompleteWidget: EntityAutocompleteWidgetType = {
  ...BasicConfig.widgets.select,
  type: 'entityReference',
  factory: props => {
    const { fieldDefinition, value, setValue } = props;
    const customSettings = fieldDefinition.fieldSettings as CustomFieldSettings;

    const onChange = v => {
      setValue(v);
    };

    return (
      <Autocomplete
        dataSourceType="entitiesList"
        entityType={customSettings.typeShortAlias}
        displayPropName='_displayName'
        keyPropName='id'
        mode='single'
        allowInherited={customSettings.allowInherited}
        value={value}
        onChange={onChange}
        style={{ minWidth: '150px' }}
        size="small"
        outcomeValueFunc={(value: any) => getValueByPropertyName(value, 'id') ?? value}
      />
    );
  },
};

export default EntityAutocompleteWidget;
