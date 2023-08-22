import { getFieldNameFromExpression, MetadataProvider, useMetadataDispatcher } from "index";
import { IModelMetadata } from "interfaces/metadata";
import { useDataContextManager, useDataContextRegister } from "providers/dataContextManager";
import React, { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from 'react';

export interface IDataContextProviderStateContext {
    id: string;
    name: string;
    description?: string;
    type: string;
    //data?: object;
    parentDataContext?: IDataContextFullInstance | null;
    metadata?: Promise<IModelMetadata>;
}

export interface IDataContextProviderActionsContext {
    setFieldValue: (name: string, value: any) => void;
    getFieldValue: (name: string) => any;
    getData: () => any;
}

/** initial state */
export const DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE: IDataContextProviderStateContext = { id: '', name: '', type: '' };

export const DataContextProviderStateContext = createContext<IDataContextProviderStateContext>(DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE);
export const DataContextProviderActionsContext = createContext<IDataContextProviderActionsContext>(undefined);

export type DataContextType = 'root' | 'custom' | 'settings';

export interface IDataContextProviderProps { 
    id: string;
    name: string;
    description?: string;
    type: DataContextType | string;
    initialData?: Promise<object>;
    metadata?: Promise<IModelMetadata>;
    onChangeData?: <T,>(data: T) => void;
}

const DataContextProvider: FC<PropsWithChildren<IDataContextProviderProps>> = ({ children, ...props }) => {
    
    const { id, name, description, type = 'custom', initialData, metadata, onChangeData } = props;

    const { onChangeContext, getDataContextData, onChangeContextData } = useDataContextManager();
    const metadataDispatcher = useMetadataDispatcher();


    const parentContext = useDataContext(false);
    const [state, setState] = useState<IDataContextProviderStateContext>({
        id,
        name,
        description,
        type,
        parentDataContext: parentContext,
        metadata
    });

    const getFieldValue = (name: string) => {
        const data = getDataContextData(props.id);
        if (!!data) {
            const propName = getFieldNameFromExpression(name);

            if (typeof propName === 'string')
              return data[propName];
            else if (Array.isArray(propName) && propName.length > 0) {
              let value = data[propName[0]];
              propName.forEach((item, index) => {
                if (index > 0)
                  value = typeof value === 'object' ? value[item] : undefined;
              });
              return value;
            }
        } else
            return undefined;
    };

    const setFieldValue = (name: string, value: any) => {
        const data = {...getDataContextData(props.id)} ?? {};
        const propName = getFieldNameFromExpression(name);
        if (typeof propName === 'string')
            data[propName] = value;
        else if (Array.isArray(propName) && propName.length > 0) {
            let prop = data[propName[0]];
            let vprop = data;
            propName.forEach((item, index) => {
                if (index < propName.length - 1) {
                    if (!(typeof prop === 'object'))
                        vprop[item] = {};
                    vprop = vprop[item];
                    prop = vprop[propName[index + 1]];
                }
            });
            vprop[propName[propName.length - 1]] = value;
        }

        if (onChangeData)
            onChangeData(data);
        onChangeContextData(props.id, data);
    };

    const getData = () => {
        return {...getDataContextData(props.id)} ?? {};
    };

    const actionContext ={
        setFieldValue,
        getFieldValue,
        getData
    };

    useEffect(() => {
        initialData?.then(res => {
            if (onChangeData)
                onChangeData(res);
            onChangeContextData(props.id, res);
        });
        metadata?.then(res => {
            onChangeContext({
                id,
                name,
                description,
                type,
                metadata: res,
                parentId: parentContext?.id,
                ...actionContext
            });
        });
    }, []);

    useEffect(() => {
        setState({...state, metadata});
        metadata?.then(res => {
            onChangeContext({
                id,
                name,
                description,
                type,
                metadata: res,
                parentId: parentContext?.id,
                ...actionContext
            });
        });
        metadataDispatcher?.updateModel(id, metadata);
    }, [metadata]);

    useEffect(() => {
        onChangeContext({
            id,
            name,
            description,
            type,
            parentId: parentContext?.id,
            ...actionContext
        });
    }, [name, description]);

    metadataDispatcher?.registerModel(id, metadata);

    useDataContextRegister({
        id,
        name,
        description,
        type,
        parentId: parentContext?.id,
        initialData: {},
        ...actionContext
    }, [id, name, parentContext?.id ]);

    return (
        <MetadataProvider id={id} modelType={id} dataType='context' > 
            <DataContextProviderActionsContext.Provider value={{ ...actionContext }}>
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