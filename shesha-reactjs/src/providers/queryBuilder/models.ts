import { IPropertyMetadata } from '@/interfaces/metadata';
import { isDefined } from '@/utils/nullables';

// Fields

/** Opaque per-property builder config kept for API compatibility; the current builder derives everything from metadata. */
export type QueryBuilderFieldConfig = Record<string, unknown>;

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
  fieldSettings?: QueryBuilderFieldConfig | CustomFieldSettings;
  childProperties: IProperty[];
  preferWidgets?: string[] | undefined;
}

export interface IHasQueryBuilderConfig extends IProperty {
  convert: (property: IProperty) => QueryBuilderFieldConfig;
}

export const propertyHasQBConfig = (property: IProperty): property is IHasQueryBuilderConfig => {
  return "convert" in property && typeof (property.convert) === 'function';
};

export interface IHasCustomQBSettings {
  toQueryBuilderField: (defaultConverter: () => QueryBuilderFieldConfig | undefined) => QueryBuilderFieldConfig;
}

export interface IPropertyMetadataWithQBSettings extends IPropertyMetadata, IHasCustomQBSettings {

}
export interface IPropertyWithCustomQBSettings extends IProperty, IHasCustomQBSettings {

}

export const hasCustomQBSettings = (property: unknown): property is IHasCustomQBSettings => {
  return isDefined(property) && typeof (property) === "object" && "toQueryBuilderField" in property && typeof (property.toQueryBuilderField) === 'function';
};
