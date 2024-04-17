import { DataTypes, IEntityMetadata } from "@/interfaces";
import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { useSyncEntitiesContext } from "./useSyncEntitiesContext";
import { getCachedMetadataByClassName, getCachedMetadataByTypeId, syncEntities } from "./utils";
import { useRef } from "react";
import { IPropertyMetadata, NestedProperties, isIHasEntityType, isPropertiesArray } from "@/interfaces/metadata";

export interface IEntityMetadataFetcher {
    syncAll: () => Promise<void>;
    getByTypeId: (typeId: IEntityTypeIndentifier) => Promise<IEntityMetadata>;
    getByClassName: (className: string) => Promise<IEntityMetadata>;
    isEntity: (className: string) => Promise<boolean>;
}

type EntityMetadataByClassNameFetcher = (className: string) => Promise<IEntityMetadata>;

export const useEntityMetadataFetcher = (): IEntityMetadataFetcher => {
    const syncContext = useSyncEntitiesContext();
    const syncPromise = useRef<Promise<void>>();

    const ensureSynchronized = (): Promise<void> => {
        if (!syncPromise.current) {
            syncPromise.current = syncEntities(syncContext);
        }
        return syncPromise.current;
    };

    const mapProperty = (property: IPropertyMetadata, byClassNameGetter: EntityMetadataByClassNameFetcher, prefix: string = ''): IPropertyMetadata => {
        const nestedProperties: NestedProperties = isPropertiesArray(property.properties)
            ? property.dataType === DataTypes.entityReference && isIHasEntityType(property)
                ? () => byClassNameGetter(property.entityType).then(m => m.properties as IPropertyMetadata[])
                : property.properties.map((child) => mapProperty(child, byClassNameGetter, property.path))
            : property.properties;

        return {
            ...property,
            path: property.path,
            prefix,
            properties: nestedProperties,
        };
    };

    const convertMetadata = (metadata: IEntityMetadata, byClassNameGetter: EntityMetadataByClassNameFetcher): IEntityMetadata => {
        if (isPropertiesArray(metadata?.properties)) {
            metadata.properties = metadata.properties.map(p => mapProperty(p, byClassNameGetter));
        }
        return metadata;
    };

    const syncAll = (): Promise<void> => {
        syncPromise.current = syncEntities(syncContext);
        return syncPromise.current;
    };

    const getByClassName = (className: string): Promise<IEntityMetadata> => {
        return ensureSynchronized().then(() => {
            return getCachedMetadataByClassName(className, syncContext).then(m => convertMetadata(m, getByClassName));
        });
    };

    const getByTypeId = (typeId: IEntityTypeIndentifier): Promise<IEntityMetadata> => {
        return ensureSynchronized().then(() => {
            return getCachedMetadataByTypeId(typeId, syncContext).then(m => convertMetadata(m, getByClassName));
        });
    };

    const isEntity = (className: string): Promise<boolean> => {
        return ensureSynchronized().then(() => {
            const typeId = syncContext.typesMap.resolve(className);
            return Boolean(typeId);
        });
    };

    const fetcher: IEntityMetadataFetcher = {
        syncAll,
        getByTypeId,
        getByClassName,
        isEntity,
    };

    return fetcher;
};