import { ConfigurableFormInstance } from "@/interfaces";
import { isEqual } from "lodash";
import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { IDataContextDescriptor, IDataContextDictionary, IRegisterDataContextPayload, SHESHA_ROOT_DATA_CONTEXT_MANAGER } from "./models";
import { DataContextType, IDataContextFull, useDataContext } from "../dataContextProvider/contexts";
import { createNamedContext } from "@/utils/react";

export const RootContexts: string[] = [];

export interface IDataContextManagerStateContext {
  lastUpdate: string;
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
}

export interface IDataContextManagerFullInstance extends IDataContextManagerStateContext, IDataContextManagerActionsContext{

}

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerStateContext = {lastUpdate: '', id: ''};

export const DataContextManagerStateContext = createNamedContext<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, "DataContextManagerStateContext");
export const DataContextManagerActionsContext = createNamedContext<IDataContextManagerActionsContext>(undefined, "DataContextManagerActionsContext");

export interface IDataContextManagerProps {
  id: string;
}

const useDataContextManagerActions = (require: boolean = true): IDataContextManagerActionsContext => {
  const actionsContext = useContext(DataContextManagerActionsContext);
  if (!actionsContext && require)
      throw new Error('useDataContextManagerActions must be used within a DataContextManager');

  return actionsContext;
};

const useDataContextManagerState = (require: boolean = true): IDataContextManagerStateContext => {
  const stateContext = useContext(DataContextManagerStateContext);
  if (!stateContext && require)
      throw new Error('useDataContextManagerState must be used within a DataContextManager');

  return stateContext;
};

const useDataContextManager = (require: boolean = true): IDataContextManagerFullInstance => {
  const actionsContext = useDataContextManagerActions(require);
  const stateContext = useDataContextManagerState(require);
  
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useDataManagerRegister = (payload: IDataContextManagerFullInstance, deps?: ReadonlyArray<any>) => {
const manager = useDataContextManager(false)?.parent;

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
  const manager = useDataContextManager(false);

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
  const dcm = useDataContextManager();

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

  const parentManager = useDataContextManager(false);

    const [state, setState] = useState<IDataContextManagerStateContext>({...DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, id, parent: parentManager});

    const contexts = useRef<IDataContextDictionary>({});
    const managers = useRef<IDataContextManagerFullInstance[]>([]);
    const formInstance = useRef<ConfigurableFormInstance>();

    const onChangeContextData = () => {
      setState({...state, lastUpdate: new Date().toJSON()});
      state.parent?.onChangeContextData();
    };

    const updatePageFormInstance = (form: ConfigurableFormInstance) => {
        formInstance.current = form;
        setState({...state, lastUpdate: new Date().toJSON() });
    };

    const getPageFormInstance = () => {
        return formInstance.current;
    };

  const registerDataManager = (payload: IDataContextManagerFullInstance) => {
    if (!managers.current.find(x => x.id === payload.id)) {
      managers.current.push(payload);
      setState({...state, lastUpdate: new Date().toJSON() });
    }
  };

  const unregisterDataManager = (payload: IDataContextManagerFullInstance) => {
    const manager = managers.current.find(x => x.id === payload.id);
    if (manager) {
      managers.current.splice(managers.current.indexOf(manager), 1);
      setState({...state, lastUpdate: new Date().toJSON() });
    }
  };

    const registerDataContext = (payload: IRegisterDataContextPayload) => {
        if (!contexts.current[payload.id]) {
            const ctx = {...payload};
            delete ctx.initialData;
            contexts.current[payload.id] = {...ctx};
            setState({...state, lastUpdate: new Date().toJSON() });

            if (payload.type === 'root')
                RootContexts.push(payload.id);
        }
    };

    const unregisterDataContext = (payload: IRegisterDataContextPayload) => {
      if (!!contexts.current[payload.id])
        delete contexts.current[payload.id];

      setState({...state, lastUpdate: new Date().toJSON() });

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

      let c = dataContexts.find(x => x.id === topId);
      while (!!c) {
        ctxs.push(c);
        c = dataContexts.find(x => x.id === c.parentId);
        if (!!c && c?.id === c?.parentId) {
          console.error(`The hierarchy of contexts is broken, id === parentId: ${c.id} {${c.name}: ${c.description}}`);
          c = null;
        }
      }
      return ctxs;
    };

    const getRoot = () => {
      if (parentManager?.id === SHESHA_ROOT_DATA_CONTEXT_MANAGER)
        return parentManager;
      if (parentManager)
        return parentManager?.getRoot();
      return null;
    };

    const getDataContexts = (topId: string) => {
      const ctxs = getLocalDataContexts(topId);
      return ctxs.concat(getRoot()?.getDataContexts('all') ?? []);
    };

    const getNearestDataContext = (topId: string, type: DataContextType) => {
      const dataContexts = getDataContexts(topId);
      return dataContexts.find(x => x.type === type);
    };

    const getPageContext = (): IDataContextDescriptor => {
      return getRoot()?.getNearestDataContext('all', 'page');
    };

    const getDataContext = (contextId: string): IDataContextDescriptor => {
      if (!contextId)
          return undefined;

      const dc = getLocalDataContexts('all').find(x => x.id === contextId);
      return dc ? dc : parentManager?.getDataContext(contextId);
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
      getRoot()?.getDataContextsData('all', res);
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
                setState({...state, lastUpdate: new Date().toJSON() });
            }
        }
    };

    const dataContextsManagerActions: IDataContextManagerActionsContext = {
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
    };

    return (
        <DataContextManagerStateContext.Provider value={state}>
            <DataContextManagerActionsContext.Provider value={dataContextsManagerActions}>
              <DataManagerAccessor>
                {children}
              </DataManagerAccessor>
            </DataContextManagerActionsContext.Provider>
        </DataContextManagerStateContext.Provider>
    );
};

export { 
  DataContextManager,
  useDataContextManager,
  useDataManagerRegister,
  useDataContextRegister,
  useNearestDataContext,
  useDataContextManagerActions,
  useDataContextManagerState 
};