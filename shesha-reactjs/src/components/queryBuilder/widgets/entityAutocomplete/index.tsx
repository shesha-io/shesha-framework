import React from 'react';
import { BasicConfig, SelectFieldSettings, TextWidget } from '@react-awesome-query-builder/antd';
import { Autocomplete } from '@/components/autocomplete';
import { CustomFieldSettings } from '@/providers/queryBuilder/models';
import { getIdOrUndefined } from '@/utils/entity';

export type EntityAutocompleteWidgetType = TextWidget & SelectFieldSettings<string>;
const EntityAutocompleteWidget: EntityAutocompleteWidgetType = {
  ...BasicConfig.widgets.select,
  type: 'entityReference',
  factory: (props) => {
    const { fieldDefinition, value, setValue } = props;
    const customSettings = fieldDefinition.fieldSettings as CustomFieldSettings;

    return (
      <Autocomplete
        dataSourceType="entitiesList"
        entityType={customSettings.typeShortAlias ?? { module: customSettings.entityTypeModule ?? '', name: customSettings.entityTypeName ?? '' }}
        displayPropName="_displayName"
        keyPropName="id"
        mode="single"
        allowInherited={customSettings.allowInherited}
        value={value}
        onChange={(newValue) => {
          setValue(typeof (newValue) === "string" ? newValue : undefined);
        }}
        style={{
          minWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          border: '1px solid #d9d9d9',
          paddingRight: '20px',
          borderRadius: '4px',
        }}
        size="small"
        outcomeValueFunc={(value) => typeof (value) === "object" ? getIdOrUndefined(value) : value}
      />
    );
  },
};

export default EntityAutocompleteWidget;
