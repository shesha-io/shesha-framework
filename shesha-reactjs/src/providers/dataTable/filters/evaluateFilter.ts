import { useDeepCompareMemoize } from "@/hooks/index";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import {  IApplicationContext, IMatchData, useAvailableConstantsContexts, wrapConstantsData } from "@/providers/form/utils";
import { NestedPropertyMetadatAccessor } from "@/providers/metadataDispatcher/contexts";
import { evaluateDynamicFilters } from "@/utils/index";
import { FilterExpression, IStoredFilter } from "../interfaces";
import { useRef } from "react";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";

interface IMatchDataWithPreparation extends IMatchData {
    prepare?: (data: any) => any;
}

export interface UseEvaluatedFilterArgs {
    filter?: FilterExpression;
    mappings: IMatchDataWithPreparation[];
    metadataAccessor?: NestedPropertyMetadatAccessor;
};

export const useEvaluatedFilter = (args: UseEvaluatedFilterArgs): string => {
    const { filter, mappings, metadataAccessor } = args;

    const evaluatedFilters = useAsyncMemo(async () => {
        if (!filter) return '';

        const preparedMappings: IMatchData[] = [];
        mappings.forEach(item => {
            const { prepare, ...restItemProps } = item;
            const preparedData = item.prepare 
                ? item.prepare(item.data)
                : item.data;
            preparedMappings.push({ ...restItemProps, data: preparedData });
        });

        const response = await evaluateDynamicFilters(
            [{ expression: filter } as IStoredFilter],
            preparedMappings,
            metadataAccessor
        );

        // note: don't return empty filter to take unevaluated filters into account
        //if (response.find((f) => f?.unevaluatedExpressions?.length)) return '';

        return JSON.stringify(response[0]?.expression) || '';
    }, useDeepCompareMemoize([filter, mappings]));

    return evaluatedFilters;
};

export interface UseFormEvaluatedFilterArgs {
    filter?: FilterExpression;
    metadataAccessor?: NestedPropertyMetadatAccessor;
};
export const useFormEvaluatedFilter = (args: UseFormEvaluatedFilterArgs, additionalData?: any) => {

    const fullContext = useAvailableConstantsContexts();
    const accessors = wrapConstantsData({ fullContext });

    const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
    if (!contextProxyRef.current) {
      contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
    } else {
      contextProxyRef.current.refreshAccessors(accessors);
    }
    if (additionalData)
        contextProxyRef.current.setAdditionalData(additionalData);

    contextProxyRef.current.checkChanged();

    const prevChanged = useRef<number>(0);
    if (contextProxyRef.current.changed )
        prevChanged.current = Date.now();

    var keys = Object.keys({...contextProxyRef.current});
    var mappings = keys.map(key => ({ match: key, data: contextProxyRef.current[key] }));

    const evaluatedFilters = useAsyncMemo(async () => {
        if (!args.filter) return '';

        const response = await evaluateDynamicFilters(
            [{ expression: args.filter } as IStoredFilter],
            mappings,
            args.metadataAccessor
        );

        return JSON.stringify(response[0]?.expression) || '';
    }, useDeepCompareMemoize([args.filter, prevChanged.current]));

    return evaluatedFilters;
};