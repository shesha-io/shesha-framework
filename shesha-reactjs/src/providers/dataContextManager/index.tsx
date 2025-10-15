import { ConfigurableFormInstance } from "@/interfaces";
import { isEqual } from "lodash";
import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IDataContextDescriptor, IDataContextDictionary, IRegisterDataContextPayload, SHESHA_ROOT_DATA_CONTEXT_MANAGER } from "./models";
import { DataContextType, IDataContextFull, useDataContextOrUndefined } from "../dataContextProvider/contexts";
import { createNamedContext } from "@/utils/react";
import { isDefined } from "@/utils/nullables";

export const DataContextTopLevels = {
  /** Only aplication root contexts */
  Root: 'root',
  /** All contexts from this Data context manager */
  All: 'all',
  /** All available contexts */
  Full: 'full',
};

export const RootContexts: string[] = [];

export interface IDataContextManagerStateContext {
  lastUpdate: number;
  id: string;
  parent?: IDataContextManagerFullInstance | undefined;
}

export interface IDataContextsData {
  [key: string]: unknown;
  lastUpdate: number;
}

export interface IDataContextManagerActionsContext {
  registerDataManager: (payload: IDataContextManagerFullInstance) => void;
  unregisterDataManager: (payload: IDataContextManagerFullInstance) => void;
  registerDataContext: (payload: IRegisterDataContextPayload) => void;
  unregisterDataContext: (payload: IRegisterDataContextPayload) => void;
  getLocalDataContexts: (contextId: string) => IDataContextDescriptor[];
  getDataContexts: (topId?: string) => IDataContextDescriptor[];
  getDataContextsData: (topId?: string, data?: IDataContextsData) => IDataContextsData;
  getDataContext: (contextId: string) => IDataContextDescriptor | undefined;
  getNearestDataContext: (topId: string, type: DataContextType) => IDataContextDescriptor | undefined;
  getDataContextData: (contextId: string) => unknown;
  onChangeContext: (dataContext: IDataContextDescriptor) => void;
  onChangeContextData: () => void;
  updatePageFormInstance: (form: ConfigurableFormInstance) => void;
  getPageFormInstance: () => ConfigurableFormInstance | undefined;
  getPageContext: () => IDataContextDescriptor | undefined;
  getRoot: () => IDataContextManagerFullInstance | undefined;
  getParent: () => IDataContextManagerFullInstance | undefined;
}

export interface IDataContextManagerFullInstance extends IDataContextManagerStateContext, IDataContextManagerActionsContext {

}

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerStateContext = { lastUpdate: 0, id: '' };

export const DataContextManagerUpdateContext = createNamedContext<object>({}, "DataContextManagerUpdateContext");
export const DataContextManagerStateContext = createNamedContext<IDataContextManagerStateContext | undefined>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, "DataContextManagerStateContext");
export const DataContextManagerActionsContext = createNamedContext<IDataContextManagerActionsContext | undefined>(undefined, "DataContextManagerActionsContext");

export interface IDataContextManagerProps {
  id: string;
}

export const useDataContextManagerUpdate = (): object => {
  return useContext(DataContextManagerUpdateContext);
};

const useDataContextManagerActionsOrUndefined = (): IDataContextManagerActionsContext | undefined => {
  return useContext(DataContextManagerActionsContext);
};

const useDataContextManagerActions = (): IDataContextManagerActionsContext => {
  const context = useDataContextManagerActionsOrUndefined();
  if (!isDefined(context))
    throw new Error('useDataContextManagerActions must be used within a DataContextManager');
  return context;
};

const useDataContextManagerStateOrUndefined = (): IDataContextManagerStateContext | undefined => {
  return useContext(DataContextManagerStateContext);
};

const useDataContextManagerState = (): IDataContextManagerStateContext => {
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

const useDataManagerRegister = (payload: IDataContextManagerFullInstance, deps?: React.DependencyList): void => {
  const manager = useDataContextManagerActionsOrUndefined()?.getParent();

  useEffect(() => {
    if (!manager)
      return undefined;

    manager.registerDataManager(payload);

    return () => {
      manager.unregisterDataManager(payload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

const useDataContextRegister = (payload: IRegisterDataContextPayload, deps?: React.DependencyList): void => {
  const manager = useDataContextManagerActionsOrUndefined();

  useEffect(() => {
    if (!manager)
      return undefined;

    manager.registerDataContext(payload);

    return () => {
      manager.unregisterDataContext(payload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

function useNearestDataContext(type: DataContextType): IDataContextDescriptor | undefined {
  const currentDataContext = useDataContextOrUndefined();
  const dcm = useDataContextManagerActions();

  if (!currentDataContext)
    return undefined;

  const nearestDataContext = dcm.getNearestDataContext(currentDataContext.id, type);
  return nearestDataContext;
}

const DataManagerAccessor: FC<PropsWithChildren<Omit<IDataContextManagerProps, 'id'>>> = ({ children }) => {
  const manager = useDataContextManager();
  useDataManagerRegister(manager, []);

  return children;
};

const DataContextManager: FC<PropsWithChildren<IDataContextManagerProps>> = ({ id, children }) => {
  const parent = useDataContextManagerOrUndefined();

  const [state, setState] = useState<IDataContextManagerStateContext>({ ...DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, id, parent: parent });

  const contexts = useRef<IDataContextDictionary>({});
  const managers = useRef<IDataContextManagerFullInstance[]>([]);
  const formInstance = useRef<ConfigurableFormInstance>();

  const internalUpdate = (): void => {
    setState({ ...state, lastUpdate: Date.now() });
  };

  const onChangeContextData = (): void => {
    internalUpdate();

    // ToDo: AS - check if we need to update parend DataContextManager
    // parent?.onChangeContextData();
    managers.current.forEach((x) => x.onChangeContextData());
  };

  const updatePageFormInstance = (form: ConfigurableFormInstance): void => {
    formInstance.current = form;
    internalUpdate();
  };

  const getPageFormInstance = (): ConfigurableFormInstance | undefined => {
    return formInstance.current;
  };

  const registerDataManager = (payload: IDataContextManagerFullInstance): void => {
    if (!managers.current.find((x) => x.id === payload.id)) {
      managers.current.push(payload);
      internalUpdate();
    }
  };

  const unregisterDataManager = (payload: IDataContextManagerFullInstance): void => {
    const manager = managers.current.find((x) => x.id === payload.id);
    if (manager) {
      managers.current.splice(managers.current.indexOf(manager), 1);
      internalUpdate();
    }
  };

  const registerDataContext = (payload: IRegisterDataContextPayload): void => {
    if (!contexts.current[payload.id]) {
      const ctx = { ...payload };
      delete ctx.initialData;
      contexts.current[payload.id] = { ...ctx };
      internalUpdate();

      if (payload.type === DataContextTopLevels.Root)
        RootContexts.push(payload.id);
    }
  };

  const unregisterDataContext = (payload: IRegisterDataContextPayload): void => {
    if (!!contexts.current[payload.id])
      delete contexts.current[payload.id];

    internalUpdate();

    if (payload.type === DataContextTopLevels.Root)
      RootContexts.splice(RootContexts.indexOf(payload.id), 1);
  };

  const getLocalDataContexts = (topId?: string): IDataContextDescriptor[] => {
    const ctxs: IDataContextDescriptor[] = [];

    const dataContexts: IDataContextDescriptor[] = [];
    for (let key in contexts.current)
      if (Object.hasOwn(contexts.current, key) && contexts.current[key].type !== 'settings')
        dataContexts.push(contexts.current[key] as IDataContextDescriptor);

    if (!topId)
      return dataContexts.filter((x) => x.type === DataContextTopLevels.Root);

    if (topId === DataContextTopLevels.All)
      return [...dataContexts];

    if (topId === DataContextTopLevels.Full) {
      const res = [...dataContexts];
      managers.current.forEach((manager) => {
        manager.getLocalDataContexts(DataContextTopLevels.Full).forEach((x) => res.push(x));
      });
      return res;
    }

    let c = dataContexts.find((x) => x.uid === topId || x.id === topId);
    while (isDefined(c)) {
      ctxs.push(c);
      const { parentUid } = c;
      c = dataContexts.find((x) => x.uid === parentUid);
      if (c && c.uid === c.parentUid) {
        console.error(`The hierarchy of contexts is broken, id === parentId: ${c.id} {${c.name}: ${c.description}}`);
        c = undefined;
      }
    }
    return ctxs;
  };

  const isRoot = (): boolean => {
    return id === SHESHA_ROOT_DATA_CONTEXT_MANAGER;
  };

  const getRoot = (): IDataContextManagerFullInstance | undefined => {
    return isDefined(parent)
      ? parent.id === SHESHA_ROOT_DATA_CONTEXT_MANAGER
        ? parent
        : parent.getRoot()
      : undefined;
  };

  const getParent = (): IDataContextManagerFullInstance | undefined => {
    return parent;
  };

  const getDataContexts = (topId?: string): IDataContextDescriptor[] => {
    const ctxs = getLocalDataContexts(topId);
    if (isRoot())
      return ctxs;
    return ctxs.concat(parent?.getDataContexts('all') ?? []);
  };

  const getNearestDataContext = (topId: string, type: DataContextType): IDataContextDescriptor | undefined => {
    const dataContexts = getDataContexts(topId);
    return dataContexts.find((x) => x.type === type);
  };

  const getPageContext = (): IDataContextDescriptor | undefined => {
    if (isRoot())
      return getNearestDataContext('all', 'page');
    else
      return getRoot()?.getNearestDataContext('all', 'page');
  };

  const getDataContext = (contextId: string): IDataContextDescriptor | undefined => {
    if (!contextId)
      return undefined;

    const dc = getLocalDataContexts('all').find((x) => x.uid === contextId || x.id === contextId);
    return dc ? dc : parent?.getDataContext(contextId);
  };

  const getDataContextData = (contextId: string): IDataContextFull | undefined => {
    if (!contextId)
      return undefined;

    return getDataContext(contextId)?.getFull();
  };


  const getLocalDataContextsData = (topId?: string, data?: IDataContextsData): IDataContextsData => {
    const res: IDataContextsData = data ?? { lastUpdate: state.lastUpdate, refreshContext: onChangeContextData };
    getDataContexts(topId).forEach((item) => {
      if (res[item.name] === undefined) {
        res[item.name] = item.getFull();
      }
    });

    return res;
  };

  const getDataContextsData = (topId?: string, data?: IDataContextsData): IDataContextsData => {
    const res = getLocalDataContextsData(topId, data);
    if (isRoot())
      return res;
    parent?.getDataContextsData('all', res);
    return res;
  };

  const onChangeContext = (payload: IDataContextDescriptor): void => {
    const existingContext = contexts.current[payload.id];
    if (isDefined(existingContext)) {
      const newCtx: IDataContextDescriptor = {
        ...payload,
        metadata: payload.metadata ?? existingContext.metadata,
      };
      const changed = !isEqual(existingContext, newCtx);
      if (changed) {
        contexts.current[payload.id] = newCtx;
        internalUpdate();
      }
    }
  };
  const dataContextsManagerActions: IDataContextManagerActionsContext = useMemo(() => {
    return {
      registerDataManager,
      unregisterDataManager,
      registerDataContext,
      unregisterDataContext,
      getLocalDataContexts,
      getDataContexts,
      getDataContextsData,
      getNearestDataContext,
      getDataContext,
      getDataContextData,
      onChangeContext,
      onChangeContextData,
      updatePageFormInstance,
      getPageFormInstance,
      getPageContext,
      getRoot,
      getParent,
    } satisfies IDataContextManagerActionsContext;
  // TODO: Alex, please review this. Looks like it's better to convert to singletone class
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [true]);

  if (isRoot()) {
    dataContextsManagerActions.getRoot = () => {
      return { ...state, ...dataContextsManagerActions };
    };
  }

  return (
    <DataContextManagerActionsContext.Provider value={dataContextsManagerActions}>
      <DataContextManagerStateContext.Provider value={state}>
        <DataManagerAccessor>
          {children}
        </DataManagerAccessor>
      </DataContextManagerStateContext.Provider>
    </DataContextManagerActionsContext.Provider>
  );
};

export {
  DataContextManager,
  useDataContextManagerOrUndefined,
  useDataContextManager,
  useDataContextManagerActions,
  useDataContextManagerActionsOrUndefined,
  useDataContextManagerState as useDataContextManagerChange,
  useDataManagerRegister,
  useDataContextRegister,
  useNearestDataContext,
};
