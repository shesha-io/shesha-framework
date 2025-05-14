import { ConfigurableFormInstance } from "@/interfaces";
import { isEqual } from "lodash";
import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IDataContextDescriptor, IDataContextDictionary, IRegisterDataContextPayload, SHESHA_ROOT_DATA_CONTEXT_MANAGER } from "./models";
import { DataContextType, IDataContextFull, useDataContext } from "../dataContextProvider/contexts";
import { createNamedContext } from "@/utils/react";

export const RootContexts: string[] = [];

export interface IDataContextManagerStateContext {
  lastUpdate: number;
  id: string;
  parent?: IDataContextManagerFullInstance;
}

export interface IDataContextsData {
  [key: string]: any;
  lastUpdate: string;
}

export interface IDataContextManagerActionsContext {
  registerDataManager: (payload: IDataContextManagerFullInstance) => void;
  unregisterDataManager: (payload: IDataContextManagerFullInstance) => void;
  registerDataContext: (payload: IRegisterDataContextPayload) => void;
  unregisterDataContext: (payload: IRegisterDataContextPayload) => void;
  getLocalDataContexts: (contextId: string) => IDataContextDescriptor[];
  getDataContexts: (topId?: string) => IDataContextDescriptor[];
  getDataContextsData: (topId?: string, data?: any) => IDataContextsData;
  getDataContext: (contextId: string) => IDataContextDescriptor;
  getNearestDataContext: (topId: string, type: DataContextType) => IDataContextDescriptor;
  getDataContextData: (contextId: string) => any;
  onChangeContext: (dataContext: IDataContextDescriptor) => void;
  onChangeContextData: () => void;
  updatePageFormInstance: (form: ConfigurableFormInstance) => void;
  getPageFormInstance: () => ConfigurableFormInstance;
  getPageContext: () => IDataContextDescriptor;
  getRoot: () => IDataContextManagerFullInstance;
  getParent: () => IDataContextManagerFullInstance;
}

export interface IDataContextManagerFullInstance extends IDataContextManagerStateContext, IDataContextManagerActionsContext{

}

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerStateContext = {lastUpdate: 0, id: ''};

export const DataContextManagerUpdateContext = createNamedContext<object>({}, "DataContextManagerUpdateContext");
export const DataContextManagerStateContext = createNamedContext<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, "DataContextManagerStateContext");
export const DataContextManagerActionsContext = createNamedContext<IDataContextManagerActionsContext>(undefined, "DataContextManagerActionsContext");

export interface IDataContextManagerProps {
  id: string;
}

export const useDataContextManagerUpdate = (): object => {
  return useContext(DataContextManagerUpdateContext);
};

const useDataContextManagerActions = (require: boolean = true): IDataContextManagerActionsContext => {
  const actionsContext = useContext(DataContextManagerActionsContext);
  if (!actionsContext && require)
      throw new Error('useDataContextManagerActions must be used within a DataContextManager');

  return actionsContext;
};

const useDataContextManagerChange = (require: boolean = false): IDataContextManagerStateContext => {
  const stateContext = useContext(DataContextManagerStateContext);
  if (!stateContext && require)
      throw new Error('useDataContextManagerState must be used within a DataContextManager');

  return stateContext;
};

const useDataContextManager = (require: boolean = true): IDataContextManagerFullInstance => {
  const actionsContext = useDataContextManagerActions(require);
  const stateContext = useDataContextManagerChange(require);
  
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useDataManagerRegister = (payload: IDataContextManagerFullInstance, deps?: ReadonlyArray<any>) => {
  const manager = useDataContextManagerActions(false)?.getParent();

  useEffect(() => {
      if (!manager)
          return undefined;

      manager.registerDataManager(payload);

      return () => {
          manager.unregisterDataManager(payload);
      };
  }, deps);
};

const useDataContextRegister = (payload: IRegisterDataContextPayload, deps?: ReadonlyArray<any>) => {
  const manager = useDataContextManagerActions(false);

  useEffect(() => {
      if (!manager)
          return undefined;

      manager.registerDataContext(payload);

      return () => {
          manager.unregisterDataContext(payload);
      };
  }, deps);
};

function useNearestDataContext(type: DataContextType): IDataContextDescriptor {
  const currentDataContext = useDataContext(false);
  const dcm = useDataContextManagerActions();

  if (!currentDataContext)
    return null;

  const nearestDataContext = dcm?.getNearestDataContext(currentDataContext.id, type);
  return nearestDataContext;
}

const DataManagerAccessor: FC<PropsWithChildren<Omit<IDataContextManagerProps, 'id'>>> = ({ children }) => {
  const manager = useDataContextManager();
  useDataManagerRegister(manager, []);
  
  return children;
};

const DataContextManager: FC<PropsWithChildren<IDataContextManagerProps>> = ({ id, children }) => {

    const parent = useDataContextManager(false);

    const [state, setState] = useState<IDataContextManagerStateContext>({...DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, id, parent: parent});

    const contexts = useRef<IDataContextDictionary>({});
    const managers = useRef<IDataContextManagerFullInstance[]>([]);
    const formInstance = useRef<ConfigurableFormInstance>();

    const internalUpdate = () => {
      setState({...state, lastUpdate: Date.now()});
    };

    const onChangeContextData = () => {
      internalUpdate();
      
      // ToDo: AS - check if we need to update parend DataContextManager
      //parent?.onChangeContextData();
      managers.current.forEach(x => x.onChangeContextData());
    };

    const updatePageFormInstance = (form: ConfigurableFormInstance) => {
        formInstance.current = form;
        internalUpdate();
    };

    const getPageFormInstance = () => {
        return formInstance.current;
    };

  const registerDataManager = (payload: IDataContextManagerFullInstance) => {
    if (!managers.current.find(x => x.id === payload.id)) {
      managers.current.push(payload);
      internalUpdate();
    }
  };

  const unregisterDataManager = (payload: IDataContextManagerFullInstance) => {
    const manager = managers.current.find(x => x.id === payload.id);
    if (manager) {
      managers.current.splice(managers.current.indexOf(manager), 1);
      internalUpdate();
    }
  };

    const registerDataContext = (payload: IRegisterDataContextPayload) => {
        if (!contexts.current[payload.id]) {
            const ctx = {...payload};
            delete ctx.initialData;
            contexts.current[payload.id] = {...ctx};
            internalUpdate();

            if (payload.type === 'root')
                RootContexts.push(payload.id);
        }
    };

    const unregisterDataContext = (payload: IRegisterDataContextPayload) => {
      if (!!contexts.current[payload.id])
        delete contexts.current[payload.id];

      internalUpdate();

      if (payload.type === 'root')
        RootContexts.splice(RootContexts.indexOf(payload.id), 1);
    };

    const getLocalDataContexts = (topId: string) => {
      const ctxs: IDataContextDescriptor[] = [];
      
      const dataContexts: IDataContextDescriptor[] = [];
      for (let key in contexts.current) 
        if (Object.hasOwn(contexts.current, key) && contexts.current[key].type !== 'settings') 
          dataContexts.push(contexts.current[key] as IDataContextDescriptor);

      if (!topId)
        return dataContexts?.filter(x => x.type === 'root') ?? [];

      if (topId === 'all')
        return [...dataContexts];

      if (topId === 'full') {
        const res = [...dataContexts];
        managers.current.forEach(manager => {
          manager.getLocalDataContexts('full').forEach(x => res.push(x));
        });
        return res;
      }

      let c = dataContexts.find(x => x.uid === topId || x.id === topId);
      while (c) {
        ctxs.push(c);
        c = dataContexts.find(x => x.uid === c.parentUid);
        if (c && c?.uid === c?.parentUid) {
          console.error(`The hierarchy of contexts is broken, id === parentId: ${c.id} {${c.name}: ${c.description}}`);
          c = null;
        }
      }
      return ctxs;
    };

    const isRoot = () => {
      return id === SHESHA_ROOT_DATA_CONTEXT_MANAGER;
    };

    const getRoot = () => {
      if (parent?.id === SHESHA_ROOT_DATA_CONTEXT_MANAGER)
        return parent;
      if (parent)
        return parent?.getRoot();
      return null;
    };

    const getParent = () => {
      return parent;
    };

    const getDataContexts = (topId: string) => {
      const ctxs = getLocalDataContexts(topId);
      if (isRoot())
        return ctxs;
      return ctxs.concat(parent?.getDataContexts('all') ?? []);
    };

    const getNearestDataContext = (topId: string, type: DataContextType) => {
      const dataContexts = getDataContexts(topId);
      return dataContexts.find(x => x.type === type);
    };

    const getPageContext = (): IDataContextDescriptor => {
      if (isRoot())
        return getNearestDataContext('all', 'page');
      else
        return getRoot()?.getNearestDataContext('all', 'page');
    };

    const getDataContext = (contextId: string): IDataContextDescriptor => {
      if (!contextId)
          return undefined;

      const dc = getLocalDataContexts('all').find(x => x.uid === contextId || x.id === contextId);
      return dc ? dc : parent?.getDataContext(contextId);
    };

    const getDataContextData = (contextId: string): IDataContextFull => {
        if (!contextId)
            return undefined;
        
        return getDataContext(contextId)?.getFull();
    };

    const getLocalDataContextsData =(topId?: string, data?: any) => {
      const res = data ?? { lastUpdate: state.lastUpdate, refreshContext: onChangeContextData };
      getDataContexts(topId).forEach(item => {
        if (res[item.name] === undefined) {
          res[item.name] = getDataContextData(item.id);
        }
      });
      return res;
    };

    const getDataContextsData =(topId?: string, data?: any) => {
      const res = getLocalDataContextsData(topId, data);
      if (isRoot())
        return res;
      parent?.getDataContextsData('all', res);
      return res;
    };

    const onChangeContext = (payload: IDataContextDescriptor) => {
        const existingContext = contexts.current[payload.id];
        if (!!existingContext) {
            const newCtx = {
                ...payload,
                metadata: payload.metadata ?? contexts.current[payload.id].metadata,
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
      };
    }, [true]);

    if (isRoot()) {
      dataContextsManagerActions.getRoot = () => {
        return {...state, ...dataContextsManagerActions};
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
  useDataContextManager,
  useDataContextManagerActions,
  useDataContextManagerChange,
  useDataManagerRegister,
  useDataContextRegister,
  useNearestDataContext,
};