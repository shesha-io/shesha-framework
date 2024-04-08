import { useCacheProvider } from "@/hooks/useCache";
import { useHttpClient } from "@/providers/sheshaApplication/publicApi/http/hooks";
import { EntityTypesMap, ISyncEntitiesContext } from "./models";
import { useMemo, useRef } from "react";
import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

type ClassNamesMap = Map<string, IEntityTypeIndentifier>;


export const useSyncEntitiesContext = (): ISyncEntitiesContext => {
    const httpClient = useHttpClient();
    const cacheProvider = useCacheProvider();
    const classNamesMap = useRef<ClassNamesMap>();

    const typesMap = useMemo<EntityTypesMap>(() => {
        classNamesMap.current = new Map();

        var map: EntityTypesMap = {
            register: (className: string, accessor: IEntityTypeIndentifier) => {
                classNamesMap.current.set(className, accessor);
            },
            resolve: (className: string): IEntityTypeIndentifier => {
                return classNamesMap.current.get(className)!;
            },
            clear: () => {
                classNamesMap.current.clear();
            }
        };
        return map;
    }, []);

    return {
        cacheProvider,
        httpClient,
        typesMap,
    };
};