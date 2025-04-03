import { useRef } from "react";
import { IApplicationContext, executeScriptSync, getActualModel, getParentReadOnly, useAvailableConstantsContexts, wrapConstantsData } from "..";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";
import { useParent } from "@/providers/parentProvider";
import { isEqual } from "lodash";
import { deepCopyViaJson } from "@/utils/object";

export function useActualContextData<T = any>(
  model: T,
  parentReadonly?: boolean,
  additionalData?: any,
  propertyFilter?: (name: string) => boolean,
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
  const actualModelRef = useRef<T>(model);

  if (contextProxyRef.current.changed || !isEqual(prevModel.current, model) || !isEqual(prevParentReadonly.current, pReadonly)) {
    const preparedData = model === null || model === undefined || Array.isArray(model) 
      ? model
      : { ...model, editMode: typeof model['editMode'] === 'undefined' ? undefined : model['editMode'] }; // add editMode property if not exists

      actualModelRef.current = executor
        ? executor(preparedData, contextProxyRef.current)
        : getActualModel(preparedData, contextProxyRef.current, pReadonly, propertyFilter);
    prevParentReadonly.current = pReadonly;
  }

  prevModel.current = deepCopyViaJson(model);

  return actualModelRef.current;
}

export function useCalculatedModel<T = any>(
  model: T,
  calculateModel?: (model: T, allData: IApplicationContext) => T
) {
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext, topContextId: 'all' });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.checkChanged();

  const prevModel = useRef<T>();
  const calculatedModelRef = useRef<T>();

  if (contextProxyRef.current.changed || !isEqual(prevModel.current, model)) {
      calculatedModelRef.current = calculateModel
        ? calculateModel(model, contextProxyRef.current as any)
        : null;
  }

  prevModel.current = deepCopyViaJson(model);

  return calculatedModelRef.current;
}

export function useActualContextExecution<T = any>(code: string, additionalData?: any) {
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.setAdditionalData(additionalData);    

  contextProxyRef.current.checkChanged();

  const prevCode = useRef<string>();
  const actualDataRef = useRef<T>(undefined);

  if (contextProxyRef.current.changed || !isEqual(prevCode.current, code)) {
    actualDataRef.current = Boolean(code) 
      ? executeScriptSync(code, contextProxyRef.current) 
      : undefined;
  }

  prevCode.current = code;

  return actualDataRef.current;
}

export function useActualContextExecutionExecutor<T = any>(executor: (context: any) => any, additionalData?: any) {
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.setAdditionalData(additionalData);    

  contextProxyRef.current.checkChanged();

  const prevCode = useRef(executor);
  const actualDataRef = useRef<T>(undefined);

  if (contextProxyRef.current.changed || !isEqual(prevCode.current, executor)) {
    actualDataRef.current = executor(contextProxyRef.current);
  }

  prevCode.current = executor;

  return actualDataRef.current;
}