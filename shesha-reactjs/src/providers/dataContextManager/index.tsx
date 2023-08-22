import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { createContext } from 'react';
import { IDataContextDescriptor, IDataContextDictionary, IRegisterDataContextPayload } from "./models";

export interface IDataContextManagerStateContext {
    lastUpdate: string;
}

export interface IDataContextManagerActionsContext {
    registerDataContext: (payload: IRegisterDataContextPayload) => void;
    unregisterDataContext: (payload: IRegisterDataContextPayload) => void;
    getDataContexts: (topId?: string) => IDataContextDescriptor[];
    getDataContextsData: (topId?: string) => {};
    getDataContext: (contextId: string) => IDataContextDescriptor;
    getDataContextData: (contextId: string) => any;
    onChangeContext: (dataContext: IDataContextDescriptor) => void;
    onChangeContextData: (contextId: string, data: any) => void;
    setActiveContext: (contextId: string) => void;
    getActiveContext: () => IDataContextDescriptor;
}

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerStateContext = {lastUpdate: new Date().toISOString()};

export const DataContextManagerStateContext = createContext<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE);
export const DataContextManagerActionsContext = createContext<IDataContextManagerActionsContext>(undefined);

export interface IDataContextManagerProps { }

const DataContextManager: FC<PropsWithChildren<IDataContextManagerProps>> = ({ children }) => {

    const [state, setState] = useState<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE);
    const [activeContextId, setActiveContextId] = useState<string>(null);

    const contextsData = useRef<{}>({});
    const contexts = useRef<IDataContextDictionary>({});

    const registerDataContext = (payload: IRegisterDataContextPayload) => {
        const ctx = {...payload, initialData: undefined};
        contexts.current[payload.id] = {...ctx};
        contextsData.current[payload.id] = {...payload.initialData};

        //setData({...contextsData, [payload.id]: payload.initialData});
        setState({...state, lastUpdate: new Date().toJSON() });
    };

    const unregisterDataContext = (payload: IRegisterDataContextPayload) => {
        if (!!contexts.current[payload.id])
            delete contexts.current[payload.id];

        setState({...state, lastUpdate: new Date().toJSON() });
    };

    const getDataContextsData =(topId?: string) => {
        const res = {};
        getDataContexts(topId).forEach(item => {
            res[item.id] = {
                ...getDataContextData(item.id),
                setFieldValue: item.setFieldValue
            };
        });
        return res;
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
        while (c != null) {
            ctxs.push(c);
            c = dataContexts.find(x => x.id === c.parentId);
        }
        return ctxs;
    };

    const getDataContext = (contextId: string) => {
        if (!contextId)
            return undefined;

        return contexts.current[contextId];
    };

    const getDataContextData = (contextId: string) => {
        if (!contextId)
            return undefined;

        return contextsData.current[contextId];
    };

    const onChangeContext = (payload: IDataContextDescriptor) => {
        const existingContext = contexts.current[payload.id];
        if (!!existingContext) {
            contexts.current[payload.id] = {...payload, metadata: payload.metadata ??  contexts.current[payload.id].metadata};
            setState({...state, lastUpdate: new Date().toJSON() });
        }
    };
    
    const onChangeContextData = (contextId: string, data: any) => {
        contextsData.current[contextId] = {...data};
        setState({...state, lastUpdate: new Date().toJSON()});
    };

    const setActiveContext = (contextId: string) => {
        if (activeContextId !== contextId)
            setActiveContextId(contextId);
    };

    const getActiveContext = () => {
        return contexts.current[activeContextId];
    };

    const dataContextsProviderActions: IDataContextManagerActionsContext = {
        registerDataContext,
        unregisterDataContext,
        getDataContexts,
        getDataContextsData,
        getDataContext,
        getDataContextData,
        onChangeContext,
        onChangeContextData,
        setActiveContext,
        getActiveContext
    };

    return (
        <DataContextManagerStateContext.Provider value={state}>
            <DataContextManagerActionsContext.Provider value={dataContextsProviderActions}>
                {children}
            </DataContextManagerActionsContext.Provider>
        </DataContextManagerStateContext.Provider>
    );
};

function useDataContextManager(require: boolean = true) {
    const actionsContext = useContext(DataContextManagerActionsContext);
    const stateContext = useContext(DataContextManagerStateContext);
  
    if ((actionsContext === undefined || stateContext === undefined) && require) {
      throw new Error('useDataContextManager must be used within a DataContextManager');
    }
    return actionsContext !== undefined && stateContext !== undefined
      ? { ...actionsContext, ...stateContext }
      : undefined;
}

function useDataContextRegister(payload: IRegisterDataContextPayload, deps?: ReadonlyArray<any>): void {
    const { registerDataContext, unregisterDataContext } = useDataContextManager(false) ?? {};

    useEffect(() => {
        if (!!registerDataContext) {
            registerDataContext(payload);
        } else
            return null;

        return () => {
            unregisterDataContext(payload);
        };
    }, deps);
}
 
export { DataContextManager, useDataContextManager, useDataContextRegister };