import { useContext } from "react";
import { DataContextManagerActionsContext, DataContextManagerStateContext } from "./index";
import { IDataContextManagerActions, IDataContextManagerFullInstance, IDataContextManagerState, IRegisterDataContextPayload } from "./models";
import { isDefined } from "@/utils/nullables";
import { useEffectOnce } from "@/hooks/useEffectOnce";

const useDataContextManagerActionsOrUndefined = (): IDataContextManagerActions | undefined => {
  return useContext(DataContextManagerActionsContext);
};

const useDataContextManagerActions = (): IDataContextManagerActions => {
  const context = useDataContextManagerActionsOrUndefined();
  if (!isDefined(context))
    throw new Error('useDataContextManagerActions must be used within a DataContextManager');
  return context;
};

const useDataContextManagerStateOrUndefined = (): IDataContextManagerState | undefined => {
  return useContext(DataContextManagerStateContext);
};

const useDataContextManagerOrUndefined = (): IDataContextManagerFullInstance | undefined => {
  const actionsContext = useDataContextManagerActionsOrUndefined();
  const stateContext = useDataContextManagerStateOrUndefined();

  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useDataContextManager = (): IDataContextManagerFullInstance => {
  const context = useDataContextManagerOrUndefined();

  if (!context)
    throw new Error('useDataContextManager must be used within a DataContextManager');

  return context;
};

const useDataManagerRegister = (payload: IDataContextManagerFullInstance): void => {
  const manager = useDataContextManagerActionsOrUndefined()?.getParent();
  // it must be registered directly during rendering, since nested components can immediately check for context and tree of DataContextManagers.
  manager?.registerDataManagerOnce(payload);
  useEffectOnce(() => () => manager?.unregisterDataManager(payload));
};

const useDataContextRegister = (payload: IRegisterDataContextPayload): void => {
  const manager = useDataContextManagerActionsOrUndefined();
  // it must be registered directly during rendering, since nested components can immediately check for context.
  manager?.registerDataContextOnce(payload);
  useEffectOnce(() => () => manager?.unregisterDataContext(payload));
};

export {
  useDataContextManagerOrUndefined,
  useDataContextManager,
  useDataContextManagerActions,
  useDataContextManagerActionsOrUndefined,
  useDataManagerRegister,
  useDataContextRegister,
};
