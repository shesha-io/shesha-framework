import { useDeepCompareMemoize } from "@/hooks/index";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { IMatchData } from "@/providers/form/utils";
import { NestedPropertyMetadatAccessor } from "@/providers/metadataDispatcher/contexts";
import { evaluateDynamicFilters } from "@/utils/index";
import { isEmpty } from "lodash";
import { FilterExpression, IStoredFilter } from "../interfaces";
import camelCaseKeys from 'camelcase-keys';
import { useFormData, useGlobalState } from "@/providers/index";

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

        if (response.find((f) => f?.unevaluatedExpressions?.length)) return '';

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
    
    return useEvaluatedFilter({ 
        ...args, 
        mappings:  [
            {
              match: 'data',
              data: formData,
              prepare: (data) => (!isEmpty(data) ? camelCaseKeys(data, { deep: true, pascalCase: true }) : data)
            },
            {
              match: 'globalState',
              data: globalState,
            },
          ]
    });
};