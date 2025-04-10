import { useDeepCompareMemoize } from "@/hooks/index";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { IMatchData } from "@/providers/form/utils";
import { NestedPropertyMetadatAccessor } from "@/providers/metadataDispatcher/contexts";
import { evaluateDynamicFilters } from "@/utils/index";
import { FilterExpression, IStoredFilter } from "../interfaces";
import { useDataContextManagerActions, useFormData, useGlobalState } from "@/providers/index";

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
export const useFormEvaluatedFilter = (args: UseFormEvaluatedFilterArgs) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const pageContext = useDataContextManagerActions(false)?.getPageContext();
    
    return useEvaluatedFilter({ 
        ...args, 
        mappings:  [
            {
              match: 'data',
              data: formData,              
            },
            {
              match: 'globalState',
              data: globalState,
            },
            {
              match: 'pageContext',
              data: {...pageContext?.getFull()},
            },
          ]
    });
};