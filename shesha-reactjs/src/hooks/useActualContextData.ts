import { useRef } from "react";
import { IApplicationContext, getActualModel, getParentReadOnly, useAvailableConstantsContexts, wrapConstantsData } from "..";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";
import { useParent } from "@/providers/parentProvider";
import { isEqual } from "lodash";

export function useActualContextData<T = any>(
  data: T,
  parentReadonly?: boolean,
  additionalData?: any,
  propertyFilter?: (name: string, value: any) => boolean,
  executor?: (data: any, context: any) => any,
) {
  const parent = useParent(false);
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext, topContextId: 'all' });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.setAdditionalData(additionalData);    

  contextProxyRef.current.checkChanged();

  const pReadonly = parentReadonly ?? getParentReadOnly(parent, contextProxyRef.current);

  const prevParentReadonly = useRef(pReadonly);
  const prevModel = useRef<T>();
  const actualModelRef = useRef<T>(data);

  if (contextProxyRef.current.changed || !isEqual(prevModel.current, data) || !isEqual(prevParentReadonly.current, pReadonly)) {
    const preparedData = data === null || data === undefined || Array.isArray(data) 
      ? data
      : { ...data, editMode: typeof data['editMode'] === 'undefined' ? undefined : data['editMode'] }; // add editMode property if not exists

      actualModelRef.current = executor
        ? executor(preparedData, contextProxyRef.current)
        : getActualModel(preparedData, contextProxyRef.current, pReadonly, propertyFilter);
    prevParentReadonly.current = pReadonly;
  }

  prevModel.current = {...data};

  return actualModelRef.current;
}