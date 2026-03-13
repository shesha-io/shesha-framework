import { useDeepCompareMemoize } from "@/hooks/index";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { IApplicationContext, IMatchData, useAvailableConstantsContexts, wrapConstantsData } from "@/providers/form/utils";
import { NestedPropertyMetadatAccessor } from "@/providers/metadataDispatcher/contexts";
import { evaluateDynamicFilters } from '@/utils/datatable';
import { FilterExpression, IStoredFilter } from "../interfaces";
import { useRef } from "react";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";

interface IMatchDataWithPreparation extends IMatchData {
  prepare?: (data: unknown) => unknown;
}

export interface UseEvaluatedFilterArgs {
  filter?: FilterExpression;
  mappings: IMatchDataWithPreparation[];
  metadataAccessor?: NestedPropertyMetadatAccessor;
};

export interface UseFormEvaluatedFilterArgs {
  filter?: FilterExpression | undefined;
  metadataAccessor?: NestedPropertyMetadatAccessor | undefined;
};
export const useFormEvaluatedFilter = (args: UseFormEvaluatedFilterArgs, additionalData?: object): string | undefined => {
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
  if (contextProxyRef.current.changed)
    prevChanged.current = Date.now();

  var keys = Object.keys({ ...contextProxyRef.current }) as Array<keyof typeof contextProxyRef.current>;
  var mappings = keys.map<IMatchData>((key) => ({ match: key, data: contextProxyRef.current?.[key] }));

  const evaluatedFilters = useAsyncMemo(async () => {
    if (!args.filter) return '';

    const response = await evaluateDynamicFilters(
      [{ expression: args.filter } as IStoredFilter],
      mappings,
      args.metadataAccessor,
    );

    return JSON.stringify(response[0]?.expression) || '';
  }, useDeepCompareMemoize([args.filter, prevChanged.current]));

  return evaluatedFilters;
};
