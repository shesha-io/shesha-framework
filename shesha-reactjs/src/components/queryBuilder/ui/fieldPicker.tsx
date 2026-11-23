import React from 'react';
import { IPropertyItem, isPropertyMetadata, PropertySelect } from '@/components/propertyAutocomplete/propertySelect';
import { DataTypes } from '@/interfaces';
import { isEntityReferencePropertyMetadata, IPropertyMetadata } from '@/interfaces/metadata';
import { isDefined } from '@/utils/nullables';

interface FieldPickerProps {
  value: string | undefined;
  onChange: (path: string | undefined) => void;
  readOnly: boolean;
  placeholder?: string | undefined;
  /** When set, only properties comparable with this one are selectable (field-to-field values). */
  compareTo?: IPropertyMetadata | undefined;
}

/** Property path picker with lazy container drill-down, shared by the rule's field and by field-sourced values. */
export const FieldPicker: React.FC<FieldPickerProps> = ({ value, onChange, readOnly, placeholder, compareTo }) => {
  const isPropertyVisible = (property: IPropertyItem): boolean => {
    if (!isDefined(compareTo)) return true;
    return isPropertyMetadata(property) &&
      (property.dataType === compareTo.dataType || property.dataType === DataTypes.entityReference || property.dataType === DataTypes.object);
  };

  const isPropertySelectable = (property: IPropertyItem): boolean => {
    if (!isDefined(compareTo)) return true;
    if (!isPropertyMetadata(property) || property.dataType !== compareTo.dataType || property.dataType === DataTypes.object) return false;
    if (!isEntityReferencePropertyMetadata(compareTo) || !isEntityReferencePropertyMetadata(property)) return true;
    return property.entityType === compareTo.entityType && property.entityModule === compareTo.entityModule;
  };

  return (
    <PropertySelect
      readOnly={readOnly}
      {...(value !== undefined ? { value } : {})}
      onChange={(next) => {
        if (next === null || next === '') onChange(undefined);
      }}
      onSelect={(key) => onChange(key)}
      size="small"
      {...(placeholder !== undefined ? { placeholder } : {})}
      isPropertyVisible={isPropertyVisible}
      isPropertySelectable={isPropertySelectable}
    />
  );
};
