import React, { useState } from "react";
import { FactoryWithContext, FieldProps } from '@react-awesome-query-builder/antd';
import { SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth } from "../domUtils";
import { IPropertyItem, IPropertySelectProps, isPropertyMetadata, PropertySelect } from "../../propertyAutocomplete/propertySelect";
import { isEntityReferencePropertyMetadata } from "@/interfaces/metadata";
import { useFieldWidget } from "../widgets/field/fieldWidgetContext";
import { CustomFieldSettings } from "@/providers/queryBuilder/models";
import { DataTypes } from "@/interfaces";
import { isDefined } from "@/utils/nullables";

type OnPropertySelect = IPropertySelectProps["onSelect"];

export const FieldAutocomplete: FactoryWithContext<FieldProps> = (props) => {
  const [text, setText] = useState(props.selectedKey);
  const fieldWidget = useFieldWidget();
  const onSelect: OnPropertySelect = (key) => {
    // check fields and expand if needed
    if (typeof (key) === 'string')
      props.setField(key);
  };

  const onChange = (key: string | null): void => {
    setText(key);
    if (!key)
      props.setField("");
  };

  const {
    config, customProps, /* items,*/ placeholder,
    selectedKey, selectedLabel, /* selectedOpts,*/ selectedAltLabel, selectedFullLabel, /* readonly,*/
  } = props;

  const { showSearch } = customProps || {};

  const selectText = (text || selectedLabel || placeholder) ?? "";
  const selectWidth = calcTextWidth(selectText);
  const isFieldSelected = !!selectedKey;

  const width = isFieldSelected && !showSearch ? undefined : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;

  let tooltipText = selectedAltLabel || selectedFullLabel;
  if (tooltipText === selectedLabel)
    tooltipText = null;

  const readOnly = isDefined(config) && config.settings.immutableFieldsMode === true;

  const isPropertyVisible = (property: IPropertyItem): boolean => {
    const { propertyMetadata } = (fieldWidget?.fieldDefinition.fieldSettings ?? {}) as Partial<CustomFieldSettings>;
    if (!propertyMetadata)
      return true;

    return isPropertyMetadata(property) &&
      (property.dataType === propertyMetadata.dataType || property.dataType === DataTypes.entityReference || property.dataType === DataTypes.object);
  };

  const isPropertySelectable = (property: IPropertyItem): boolean => {
    const { propertyMetadata } = (fieldWidget?.fieldDefinition.fieldSettings ?? {}) as Partial<CustomFieldSettings>;
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

  const size = isDefined(config)
    ? config.settings.renderSize === 'medium' ? 'middle' : config.settings.renderSize
    : undefined;

  return (
    <PropertySelect
      readOnly={readOnly}
      value={text ?? ""}
      onChange={onChange}
      style={{ width }}
      {...(size ? { size } : {})}
      onSelect={onSelect}
      isPropertyVisible={isPropertyVisible}
      isPropertySelectable={isPropertySelectable}
    />
  );
};
