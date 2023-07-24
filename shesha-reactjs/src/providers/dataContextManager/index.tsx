import { IDataContextFullInstance } from "providers/dataContextProvider";
import { IRegisterDataContextPayload } from "providers/dataContextProvider/models";
import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { createContext } from 'react';
import { IDataContextDescriptor, IDataContextDictionary, IGetDataContextPayload } from "./models";

export interface IDataContextManagerStateContext {
    activeContext: IDataContextFullInstance;
    contexts: IDataContextDictionary;
}

export interface IDataContextManagerActionsContext {
    registerDataContext: (payload: IRegisterDataContextPayload) => void;
    getDataContexts: (topId: string) => IDataContextDescriptor[];
    unregisterDataContext: (payload: IRegisterDataContextPayload) => void;
    getDataContext: (payload: IGetDataContextPayload | string) => IDataContextDescriptor;
    onChangeContext: (contextId: string, dataContext: IDataContextFullInstance) => void;
    setActiveContext: (context: IDataContextFullInstance) => void;
    getActiveContext: () => IDataContextFullInstance;
}

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerStateContext = {activeContext: null, contexts: {}};

export const DataContextManagerStateContext = createContext<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE);
export const DataContextManagerActionsContext = createContext<IDataContextManagerActionsContext>(undefined);

export interface IDataContextManagerProps { }

const DataContextManager: FC<PropsWithChildren<IDataContextManagerProps>> = ({ children }) => {

    const [state, setState] = useState<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE);

    const contexts = useRef<IDataContextDictionary>({});

    const registerDataContext = (payload: IRegisterDataContextPayload) => {
        const existingContext = contexts.current[payload.id];
        if (!existingContext) {
            contexts.current[payload.id] = {
            id: payload.id,
            name: payload.name,
            type: payload.type,
            dataContext: payload.dataContext,
          };
        } else {
            existingContext.dataContext = payload.dataContext;
        }

        setState({...state, contexts: contexts.current });
    };

    const unregisterDataContext = (payload: IRegisterDataContextPayload) => {
        if (!!contexts.current[payload.id])
            delete contexts.current[payload.id];

        setState({...state, contexts: contexts.current });
    };

    const getDataContexts = (topId: string) => {
        const contexts: IDataContextDescriptor[] = [];
        
        const dataContexts: IDataContextDescriptor[] = [];
        for (let key in state.contexts) 
            if (Object.hasOwn(state.contexts, key)) 
                dataContexts.push(state.contexts[key] as IDataContextDescriptor);

        if (!topId)
            return dataContexts?.filter(x => x.type === 'root') ?? [];

        if (topId === 'all')
            return dataContexts;

        let c = dataContexts.find(x => x.id === topId);
        while (c != null) {
            contexts.push(c);
            c = dataContexts.find(x => x.id === c.parentId);
        }
        return contexts;
    };

    const getDataContext = (payload: IGetDataContextPayload | string) => {
        if (!payload)
            return undefined;

        return (typeof(payload) === 'string') 
            ? contexts.current[payload]
            : contexts.current[`${payload.id}`];
    };

    const onChangeContext = (contextId: string, dataContext: IDataContextFullInstance) => {
        const existingContext = contexts.current[contextId];
        if (!!existingContext) {
            existingContext.dataContext = dataContext;
            setState({...state, contexts: contexts.current });
        }
    };

    const setActiveContext = (context: IDataContextFullInstance) => {
        if (state.activeContext !== context)
            setState({...state, activeContext: context});
    };

    const getActiveContext = () => {
        return state.activeContext;
    };

    const dataContextsProviderActions: IDataContextManagerActionsContext = {
        registerDataContext,
        unregisterDataContext,
        getDataContexts,
        getDataContext,
        onChangeContext,
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