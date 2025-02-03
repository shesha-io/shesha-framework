import { useRef } from "react";
import { IApplicationContext, executeScriptSync, useAvailableConstantsContexts, wrapConstantsData } from "..";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";
import { isEqual } from "lodash";

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

  const prevCode = useRef(executor);
  const actualDataRef = useRef<T>(undefined);

  if (contextProxyRef.current.changed || !isEqual(prevCode.current, executor)) {
    actualDataRef.current = executor(contextProxyRef.current);
  }

  prevCode.current = executor;

  return actualDataRef.current;
}