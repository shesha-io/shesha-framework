import camelcase from "camelcase";
import { useMemo } from "react";
import { IPropertyMetadata, asPropertiesArray, isEntityReferencePropertyMetadata } from "@/interfaces/metadata";
import { useMetadata } from "@/providers/metadata";
import { IProperty, hasCustomQBSettings, IPropertyWithCustomQBSettings } from "./models";

/**
 * Convert property metadata to QueryBuilder property
 *
 * @param property property metadata
 * @returns
 */
export const propertyMetadata2QbProperty = (property: IPropertyMetadata): IProperty => {
  const base: IProperty = {
    label: property.label,
    propertyName: property.path,
    visible: property.isVisible,
    dataType: property.dataType,
    fieldSettings: {
      typeShortAlias: isEntityReferencePropertyMetadata(property) ? property.entityType : undefined,
      referenceListName: property.referenceListName,
      referenceListModule: property.referenceListModule,
      allowInherited: true,
      propertyMetadata: property,
    },
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

export const useMetadataFields = (): IProperty[] | null => {
  const metadata = useMetadata(false);

  const fields = useMemo<IProperty[]>(() => {
    if (metadata) {
      const properties = asPropertiesArray(metadata?.metadata?.properties, []);
      if (Boolean(properties))
        return properties.map<IProperty>((property) => propertyMetadata2QbProperty(property));
    }
    return null;
  }, [metadata, metadata?.metadata]);

  return fields;
};
