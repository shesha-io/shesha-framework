import { MetadataProvider, useMetadataDispatcher } from "index";
import { IModelMetadata } from "interfaces/metadata";
import { useDataContextManager, useDataContextRegister } from "providers/dataContextManager";
import React, { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from 'react';

export interface IDataContextProviderStateContext {
    id: string;
    name: string;
    type: string;
    data?: object;
    parentDataContext?: IDataContextFullInstance | null;
    metadata?: Promise<IModelMetadata> | null;
}

export interface IDataContextProviderActionsContext {
    onChange: (name: string | string[], value: any) => void;
}

/** initial state */
export const DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE: IDataContextProviderStateContext = { id: '', name: '', type: '', data: {} };

export const DataContextProviderStateContext = createContext<IDataContextProviderStateContext>(DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE);
export const DataContextProviderActionsContext = createContext<IDataContextProviderActionsContext>(undefined);

export type DataContextType = 'root' | 'custom' | string;

export interface IDataContextProviderProps { 
    id: string;
    name: string;
    type: DataContextType;
    initialData?: Promise<object> | object;
    metadata?: Promise<IModelMetadata>;
    onChangeData?: <T,>(data: T) => void;
}

const DataContextProvider: FC<PropsWithChildren<IDataContextProviderProps>> = ({ children, ...props }) => {
    
    const { id, name, type = 'custom', initialData, metadata, onChangeData } = props;

    const { onChangeContext } = useDataContextManager();
    const metadataDispatcher = useMetadataDispatcher();

    const parentContext = useDataContext(false);
    const [state, setState] = useState<IDataContextProviderStateContext>({ 
        id,
        name,
        type,
        data: typeof ((initialData as Promise<object>)?.then) === 'undefined' ? initialData ?? {} : {},
        parentDataContext: parentContext,
        metadata
    });

    useEffect(() => {
        if (typeof (initialData as Promise<object>)?.then === 'function')
            (initialData as Promise<object>)?.then(res => {
                setState({...state, data: res});
            });
    }, []);

    useEffect(() => {
        setState({...state, metadata});
        onChangeContext(id, {...state, onChange});
        metadataDispatcher?.updateModel(id, metadata);
    }, [metadata]);

    const onChange = (name: string  | string[], value: any) => {
        const data = {...state.data} ?? {};
        if (typeof name === 'string')
            data[name] = value;
        else if (Array.isArray(name) && name.length > 0) {
            let prop = data[name[0]];
            let vprop = data;
            name.forEach((item, index) => {
                if (index < name.length - 1) {
                    if (!(typeof prop === 'object'))
                        vprop[item] = {};
                    vprop = vprop[item];
                    prop = vprop[name[index + 1]];
                }
            });
            vprop[name[name.length - 1]] = value;
        }

        setState({...state, data});
    };

    useEffect(() => {
        onChangeContext(id, {...state, onChange});
        if (!!onChangeData)
            onChangeData({...state.data});
    }, [state.data]);

    metadataDispatcher?.registerModel(id, metadata);

    useDataContextRegister({id, dataContext: {...state, onChange}, name, type, parentId: parentContext?.id}, [id, name, parentContext?.id ]);

    return (
        <MetadataProvider id={id} modelType={id} dataType='context' > 
            <DataContextProviderActionsContext.Provider value={{ onChange }}>
                <DataContextProviderStateContext.Provider value={state}>
                    <>{children}</> 
                </DataContextProviderStateContext.Provider>
            </DataContextProviderActionsContext.Provider>
        </MetadataProvider>
    );
};

export interface IDataContextRegistrarProps extends IDataContextProviderProps { 
    parentDataContext?: IDataContextFullInstance;
}

function useDataContext(require: boolean = true) {
    const actionsContext = useContext(DataContextProviderActionsContext);
    const stateContext = useContext(DataContextProviderStateContext);
  
    if ((actionsContext === undefined || stateContext === undefined) && require) {
      throw new Error('useDataContext must be used within a DataContextProvider');
    }
    return actionsContext !== undefined && stateContext !== undefined
      ? { ...actionsContext, ...stateContext } as IDataContextFullInstance
      : undefined;
}

export interface IDataContextFullInstance extends IDataContextProviderStateContext, IDataContextProviderActionsContext { }
 
export { DataContextProvider, useDataContext };