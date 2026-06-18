import camelcase from "camelcase";
import { IPropertyMetadata, isEntityReferencePropertyMetadata } from "@/interfaces/metadata";
import { IProperty, hasCustomQBSettings, IPropertyWithCustomQBSettings } from "./models";

/**
 * Convert property metadata to QueryBuilder property
 *
 * @param property property metadata
 * @returns
 */
export const propertyMetadata2QbProperty = (property: IPropertyMetadata): IProperty => {
  const base: IProperty = {
    label: property.label ?? "",
    propertyName: property.path,
    visible: property.isVisible ?? true,
    dataType: property.dataType,
    fieldSettings: {
      entityTypeName: isEntityReferencePropertyMetadata(property) ? property.entityType : undefined,
      entityTypeModule: isEntityReferencePropertyMetadata(property) ? property.entityModule : undefined,
      referenceListName: property.referenceListName,
      referenceListModule: property.referenceListModule,
      allowInherited: true,
      propertyMetadata: property,
    },
    childProperties: [],
  };

  return !hasCustomQBSettings(property)
    ? base
    : {
      ...base,
      toQueryBuilderField: hasCustomQBSettings(property) ? property.toQueryBuilderField : undefined,
    } as IPropertyWithCustomQBSettings;
};

export const getPropertyFullPath = (path: string, prefix: string): string => {
  return prefix ? `${prefix}.${camelcase(path)}` : camelcase(path);
};
