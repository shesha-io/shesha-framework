import camelcase from "camelcase";
import { useMemo } from "react";
import { IPropertyMetadata } from "../../interfaces/metadata";
import { useMetadata } from "../metadata";
import { IProperty } from "./models";

/**
 * Convert property metadata to QueryBuilder property
 * @param property property metadata
 * @returns 
 */
export const propertyMetadata2QbProperty = (property: IPropertyMetadata): IProperty => {
    return {
        label: property.label,
        propertyName: property.path,
        visible: property.isVisible,
        dataType: property.dataType,
        fieldSettings: {
            typeShortAlias: property.entityType,
            referenceListName: property.referenceListName,
            referenceListModule: property.referenceListModule,
            allowInherited: true,
        },
    };
}

export const getPropertyFullPath = (path: string, prefix: string) => {
    return prefix ? `${prefix}.${camelcase(path)}` : camelcase(path);
}

export const useMetadataFields = () => {
    const metadata = useMetadata(false);

    const fields = useMemo<IProperty[]>(() => {
        if (metadata) {
            const properties = metadata?.metadata?.properties || [];
            if (Boolean(properties))
                return properties.map<IProperty>(property => propertyMetadata2QbProperty(property));
        }
        return null;
    }, [metadata, metadata?.metadata]);

    return fields;
};