import { useMemo, useRef } from "react";
import { useGet } from "restful-react";
import { GENERIC_ENTITIES_ENDPOINT } from "../constants";
import { EntityData, IAbpWrappedGetEntityListResponse, IGetAllPayload } from "../interfaces/gql";
import { camelcaseDotNotation } from "../providers/form/utils";

export interface IUseEntityDisplayTextProps {
    entityType?: string;
    propertyName?: string;
    selection?: string | string[];
}

interface IGetEntityPayload extends IGetAllPayload {
    entityType: string;
}

const buildFilterById = (value: string | string[]): string => {
    if (!value) return null;

    const ids = Array.isArray(value) ? value : [value];
    const expression = { in: [{ var: 'Id' }, ids] };
    return JSON.stringify(expression);
};

const normalizePropertyName = (propName: string): string => {
    return !propName || propName.startsWith('_')
        ? propName
        : camelcaseDotNotation(propName);
}

export const useEntityDisplayText = (props: IUseEntityDisplayTextProps): string => {
    const selection = useEntitySelectionData(props);
    const rows = selection?.rows;

    const result = useMemo<string>(() => {
        if (!rows)
            return null;

        const result = rows.map(ent => ent[normalizePropertyName(props.propertyName)] ?? 'unknown').join(',');
        return result;
    }, [selection]);

    return result;
};

export interface IEntitySelectionResult {
    rows: EntityData[];
    loading: boolean;
}

interface ILoadedSelectionSummary {
    keys: string[],
    entityType: string;
    propertyName: string;
}

export const useEntitySelectionData = (props: IUseEntityDisplayTextProps): IEntitySelectionResult => {
    const { entityType, propertyName, selection } = props;
    const lastSelection = useRef<ILoadedSelectionSummary>();
    
    const itemsAlreadyLoaded = selection && Array.isArray(selection) 
        && lastSelection.current
        && lastSelection.current.entityType === entityType
        && lastSelection.current.propertyName === propertyName
        && !Boolean(selection.find(item => !lastSelection.current.keys.includes(item)));   

    const displayProperty = normalizePropertyName(propertyName) ?? '_displayName';

    const getValuePayload: IGetEntityPayload = {
        skipCount: 0,
        maxResultCount: 1000,
        entityType: entityType,
        properties: `id ${displayProperty}`,
        filter: buildFilterById(selection),
    };
    const isEmptySelection = !selection || Array.isArray(selection) && selection.length === 0;
    const canFetch = !isEmptySelection && entityType;
    const mustFetch = canFetch && !itemsAlreadyLoaded;

    const valueFetcher = useGet<IAbpWrappedGetEntityListResponse, any, IGetEntityPayload>(
        `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
        {
            lazy: !mustFetch,
            queryParams: getValuePayload,
        }
    );

    const valueItems = valueFetcher.data?.result?.items;
    const result = useMemo<EntityData[]>(() => {
        if (!entityType || !propertyName || !selection)
            return null;
        if (!valueItems || valueItems.length === 0)
            return null;

        const result = valueItems?.filter(ent => !itemsAlreadyLoaded || Array.isArray(selection) && selection.includes(ent.id.toString()))
            .map<EntityData>(ent => ({ id: ent.id, [propertyName]: ent[normalizePropertyName(propertyName)] ?? 'unknown' }));
        
        lastSelection.current = valueFetcher?.loading === false && selection && Array.isArray(selection)
            ? {
                keys: result.map(e => e.id.toString()),
                entityType: entityType,
                propertyName: propertyName,
            }
            : null;

        return result;
    }, [entityType, propertyName, selection, valueItems]);

    return {
        rows: result,
        loading: valueFetcher.loading,
    };
};