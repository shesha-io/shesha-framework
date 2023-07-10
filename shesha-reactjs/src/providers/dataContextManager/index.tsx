import { IRegisterDataContextPayload } from "providers/dataContextProvider/models";
import React, { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from 'react';
import { IDataContextDescriptor, IDataContextDictionary, IGetDataContextPayload } from "./models";

export interface IDataContextManagerStateContext {
    contexts: IDataContextDictionary;
}

export interface IDataContextManagerActionsContext {
    registerDataContext: (payload: IRegisterDataContextPayload) => void;
    getDataContexts: (topId: string) => IDataContextDescriptor[];
    unregisterDataContext: (payload: IRegisterDataContextPayload) => void;
    getDataContext: (payload: IGetDataContextPayload | string) => IDataContextDescriptor;
    onChange: (contextId: string, name: string | string[], value: any) => void;
}

/** initial state */
export const DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE: IDataContextManagerStateContext = {contexts: {}};

export const DataContextManagerStateContext = createContext<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE);
export const DataContextManagerActionsContext = createContext<IDataContextManagerActionsContext>(undefined);

export interface IDataContextManagerProps { }

const DataContextManager: FC<PropsWithChildren<IDataContextManagerProps>> = ({ children }) => {

    const [state, setState] = useState<IDataContextManagerStateContext>(DATA_CONTEXT_MANAGER_CONTEXT_INITIAL_STATE);

    const registerDataContext = (payload: IRegisterDataContextPayload) => {
        setState(prev => {
            return {
                ...prev,
                contexts: {
                    ...prev.contexts,
                    [`${payload.id}`]: { id: payload.id, name: payload.name, parentId: payload.parentId, type: payload.type, data: payload.data ?? {} }
                }
              };
        });
    };

    const unregisterDataContext = (payload: IRegisterDataContextPayload) => {
        setState(prev => {
            const newState = {...prev};
            delete newState.contexts[`${payload.id}`];
            return newState;
        });
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
            ? state.contexts[payload]
            : state.contexts[`${payload.id}`];//_${payload.name}`];
    };

    const onChange = (contextId: string, name: string, value: any) => {
        const newState = {...state};
        newState.contexts[contextId].data[name] = value;
        setState(newState);
        /*setState(prev => {
            return {...prev,
                contexts: { ...prev.contexts,
                    [contextId]: { ...prev.contexts[contextId]
                        data: {...state.data, [name]: value}}
                    }
                }
        });*/
    };

    const dataContextsProviderActions: IDataContextManagerActionsContext = {
        registerDataContext,
        unregisterDataContext,
        getDataContexts,
        getDataContext,
        onChange
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
      ? { ...actionsContext, stateContext }
      : undefined;
}

function useDataContextRegister(payload: IRegisterDataContextPayload, deps?: ReadonlyArray<any>): void {
    const { registerDataContext: registerManager, unregisterDataContext } = useDataContextManager(false) ?? {};

    useEffect(() => {
        if (!!registerManager) {
            registerManager(payload);
        } else
            return null;

        return () => {
            unregisterDataContext(payload);
        };
    }, deps);
}
 
export { DataContextManager, useDataContextManager, useDataContextRegister };