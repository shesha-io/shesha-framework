import { useContext } from "react";
import { DataContextManagerActionsContext, DataContextManagerStateContext, DataContextManagerUpdateContext } from "./index";
import { IDataContextDescriptor, IDataContextManagerActions, IDataContextManagerFullInstance, IDataContextManagerState, IRegisterDataContextPayload } from "./models";
import { isDefined } from "@/utils/nullables";
import { DataContextType, useDataContextOrUndefined } from "../dataContextProvider/contexts";
import { useEffectOnce } from "@/hooks/useEffectOnce";

export const useDataContextManagerUpdate = (): object => {
  return useContext(DataContextManagerUpdateContext);
};

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

const useDataContextManagerState = (): IDataContextManagerState => {
  const stateContext = useDataContextManagerStateOrUndefined();
  if (!stateContext)
    throw new Error('useDataContextManagerState must be used within a DataContextManager');

  return stateContext;
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
  manager?.registerDataManager(payload);
  useEffectOnce(() => () => manager?.unregisterDataManager(payload));
};

const useDataContextRegister = (payload: IRegisterDataContextPayload): void => {
  const manager = useDataContextManagerActionsOrUndefined();
  manager?.registerDataContext(payload);
  useEffectOnce(() => () => manager?.unregisterDataContext(payload));
};

function useNearestDataContext(type: DataContextType): IDataContextDescriptor | undefined {
  const currentDataContext = useDataContextOrUndefined();
  const dcm = useDataContextManagerActions();

  if (!currentDataContext)
    return undefined;

  const nearestDataContext = dcm.getNearestDataContext(currentDataContext.id, type);
  return nearestDataContext;
};

export {
  useDataContextManagerOrUndefined,
  useDataContextManager,
  useDataContextManagerActions,
  useDataContextManagerActionsOrUndefined,
  useDataContextManagerState as useDataContextManagerChange,
  useDataManagerRegister,
  useDataContextRegister,
  useNearestDataContext,
};
