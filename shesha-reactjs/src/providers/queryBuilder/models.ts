import { FieldOrGroup, FieldSettings } from '@react-awesome-query-builder/antd';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { isDefined } from '@/utils/nullables';

// Fields

export interface CustomFieldSettings {
  typeShortAlias?: string;

  entityTypeName?: string | undefined;
  entityTypeModule?: string | undefined;
  referenceListName?: string | undefined;
  referenceListModule?: string | undefined;
  allowInherited?: boolean;
  propertyMetadata: IPropertyMetadata;
}

export interface IProperty {
  label: string;
  propertyName: string;
  dataType: string;
  visible: boolean;
  fieldSettings?: FieldSettings | CustomFieldSettings;
  childProperties: IProperty[];
  preferWidgets?: string[] | undefined;
}

export interface IHasQueryBuilderConfig extends IProperty {
  convert: (property: IProperty) => FieldOrGroup;
}

export const propertyHasQBConfig = (property: IProperty): property is IHasQueryBuilderConfig => {
  return "convert" in property && typeof (property.convert) === 'function';
};

export interface IHasCustomQBSettings {
  toQueryBuilderField: (defaultConverter: () => FieldOrGroup) => FieldOrGroup;
}

export interface IPropertyMetadataWithQBSettings extends IPropertyMetadata, IHasCustomQBSettings {

}
export interface IPropertyWithCustomQBSettings extends IProperty, IHasCustomQBSettings {

}

export const hasCustomQBSettings = (property: unknown): property is IHasCustomQBSettings => {
  return isDefined(property) && typeof (property) === "object" && "toQueryBuilderField" in property && typeof (property.toQueryBuilderField) === 'function';
};
