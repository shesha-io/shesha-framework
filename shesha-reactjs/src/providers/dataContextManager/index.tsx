import { ConfigurableFormInstance } from "@/interfaces";
import { isEqual } from "lodash";
import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { IDataContextDescriptor, IDataContextDictionary, IRegisterDataContextPayload } from "./models";
import { DataContextType, IDataContextFull, useDataContext } from "../dataContextProvider/contexts";
import { createNamedContext } from "@/utils/react";

export const RootContexts: string[] = [];

export interface IDataContextManagerStateContext {
    lastUpdate: string;
}

export interface IDataContextsData {
    [key: string]: any;
    lastUpdate: string;
}

export interface IDataContextManagerActionsContext {
    registerDataContext: (payload: IRegisterDataContextPayload) => void;
    unregisterDataContext: (payload: IRegisterDataContextPayload) => void;
    getDataContexts: (topId?: string) => IDataContextDescriptor[];
    getDataContextsData: (topId?: string) => IDataContextsData;
    getDataContext: (contextId: string) => IDataContextDescriptor;
    getNearestDataContext: (topId: string, type: DataContextType) => IDataContextDescriptor;
    getDataContextData: (contextId: string) => any;
    onChangeContext: (dataContext: IDataContextDescriptor) => void;
    onChangeContextData: () => void;
    updatePageFormInstance: (form: ConfigurableFormInstance) => void;
    getPageFormInstance: () => ConfigurableFormInstance;
    getPageContext: () => IDataContextDescriptor;
}

export interface IDataContextManagerFullInstance extends IDataContextManagerStateContext, IDataContextManagerActionsContext{

}

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerStateContext = {lastUpdate: ''};

export const DataContextManagerStateContext = createNamedContext<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE, "DataContextManagerStateContext");
export const DataContextManagerActionsContext = createNamedContext<IDataContextManagerActionsContext>(undefined, "DataContextManagerActionsContext");

export interface IDataContextManagerProps {}

const DataContextManager: FC<PropsWithChildren<IDataContextManagerProps>> = ({ children }) => {

    const [state, setState] = useState<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE);

    const contexts = useRef<IDataContextDictionary>({});
    const formInstance = useRef<ConfigurableFormInstance>();

    const onChangeContextData = () => {
      setState({...state, lastUpdate: new Date().toJSON()});
    };

    const updatePageFormInstance = (form: ConfigurableFormInstance) => {
        formInstance.current = form;
        setState({...state, lastUpdate: new Date().toJSON() });
    };

    const getPageFormInstance = () => {
        return formInstance.current;
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

    const getDataContexts = (topId: string) => {
        const ctxs: IDataContextDescriptor[] = [];
        
        const dataContexts: IDataContextDescriptor[] = [];
        for (let key in contexts.current) 
            if (Object.hasOwn(contexts.current, key) && contexts.current[key].type !== 'settings') 
                dataContexts.push(contexts.current[key] as IDataContextDescriptor);

        if (!topId)
            return dataContexts?.filter(x => x.type === 'root') ?? [];

        if (topId === 'all')
            return dataContexts;

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

    const getNearestDataContext = (topId: string, type: DataContextType) => {
      const dataContexts = getDataContexts(topId);
      return dataContexts.find(x => x.type === type);
    };

    const getPageContext = (): IDataContextDescriptor => {
      return getNearestDataContext('all', 'page');
    };

    const getDataContext = (contextId: string): IDataContextDescriptor => {
        if (!contextId)
            return undefined;

        return contexts.current[contextId];
    };

    const getDataContextData = (contextId: string): IDataContextFull => {
        if (!contextId)
            return undefined;
        
        return contexts.current[contextId]?.getFull();
    };

    const getDataContextsData =(topId?: string) => {
        const res = { lastUpdate: state.lastUpdate, refreshContext: onChangeContextData };
        getDataContexts(topId).forEach(item => {
            res[item.name] = getDataContextData(item.id);
        });
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
        registerDataContext,
        unregisterDataContext,
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
    };

    return (
        <DataContextManagerStateContext.Provider value={state}>
            <DataContextManagerActionsContext.Provider value={dataContextsManagerActions}>
                {children}
            </DataContextManagerActionsContext.Provider>
        </DataContextManagerStateContext.Provider>
    );
};

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

export { DataContextManager, useDataContextManager, useDataContextRegister, useNearestDataContext, useDataContextManagerActions, useDataContextManagerState };