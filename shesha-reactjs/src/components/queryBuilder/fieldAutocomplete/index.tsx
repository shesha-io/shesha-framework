import React, { useState } from "react";
import { FactoryWithContext, FieldProps } from '@react-awesome-query-builder/antd';
import { IPropertyItem, IPropertySelectProps, isPropertyMetadata, PropertySelect } from "../../propertyAutocomplete/propertySelect";
import { isEntityReferencePropertyMetadata } from "@/interfaces/metadata";
import { useFieldWidget } from "../widgets/field/fieldWidgetContext";
import { CustomFieldSettings } from "@/providers/queryBuilder/models";
import { DataTypes } from "@/interfaces";
import { PackedSelect } from '../packedControl';

type OnPropertySelect = IPropertySelectProps["onSelect"];

export const FieldAutocomplete: FactoryWithContext<FieldProps> = (props) => {
  const [text, setText] = useState(props.selectedKey);
  const fieldWidget = useFieldWidget();
  const onSelect: OnPropertySelect = (key) => {
    // check fields and expand if needed
    if (typeof (key) === 'string')
      props.setField(key);
  };

  const onChange = (key): void => {
    setText(key);
    if (!key)
      props.setField(null);
  };

  const {
    config, /* items,*/ placeholder,
  } = props;

  const readOnly = config.settings.immutableFieldsMode === true;

  const isPropertyVisible = (property: IPropertyItem): boolean => {
    const { propertyMetadata } = (fieldWidget?.fieldDefinition?.fieldSettings ?? {}) as CustomFieldSettings;
    if (!propertyMetadata)
      return true;

    return isPropertyMetadata(property) &&
      (property.dataType === propertyMetadata.dataType || property.dataType === DataTypes.entityReference || property.dataType === DataTypes.object);
  };

  const isPropertySelectable = (property: IPropertyItem): boolean => {
    const { propertyMetadata } = (fieldWidget?.fieldDefinition?.fieldSettings ?? {}) as CustomFieldSettings;
    if (!propertyMetadata)
      return true;

    return isPropertyMetadata(property) &&
      property.dataType === propertyMetadata.dataType &&
      (isEntityReferencePropertyMetadata(propertyMetadata)
        ? !isEntityReferencePropertyMetadata(property) || (property.entityType === propertyMetadata.entityType && property.entityModule === propertyMetadata.entityModule)
        : true
      ) &&
      property.dataType !== DataTypes.object;
  };

  return (
    <PackedSelect variant="field">
      <PropertySelect
        readOnly={readOnly}
        value={text}
        onChange={onChange}
        style={{ width: '100%', minWidth: 0 }}
        size={config.settings.renderSize === 'medium' ? 'middle' : config.settings.renderSize}
        onSelect={onSelect}
        placeholder={placeholder}
        variant="borderless"
        isPropertyVisible={isPropertyVisible}
        isPropertySelectable={isPropertySelectable}
      />
    </PackedSelect>
  );
};
