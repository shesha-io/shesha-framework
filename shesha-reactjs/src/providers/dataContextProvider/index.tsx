import { useDeepCompareEffect } from "hooks/useDeepCompareEffect";
import { getFieldNameFromExpression, MetadataProvider, useMetadataDispatcher } from "index";
import { IModelMetadata } from "interfaces/metadata";
import { useDataContextManager, useDataContextRegister } from "providers/dataContextManager";
import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { createContext } from 'react';
import { setValueByPropertyName } from "utils/object";

export interface IDataContextProviderStateContext {
    id: string;
    name: string;
    description?: string;
    type: string;
    //data?: object;
    parentDataContext?: IDataContextFullInstance | null;
    metadata?: Promise<IModelMetadata>;
    api?: object;
}

export interface IDataContextProviderActionsContext {
    setFieldValue: (name: string, value: any) => void;
    getFieldValue: (name: string) => any;
    setData: (data: any) => void;
    getData: () => any;
    updateApi: (api: object) => any;
    updateOnChangeData: (func: IContextOnChangeData) => void;
}

/** initial state */
export const DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE: IDataContextProviderStateContext = { id: '', name: '', type: '' };

export const DataContextProviderStateContext = createContext<IDataContextProviderStateContext>(DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE);
export const DataContextProviderActionsContext = createContext<IDataContextProviderActionsContext>(undefined);

export type DataContextType = 'root' | 'custom' | 'settings' | 'table';

export type IContextOnChangeData = <T,>(data: T, changedData: any) => void;

export interface IDataContextProviderProps { 
    id: string;
    name: string;
    description?: string;
    type: DataContextType | string;
    initialData?: Promise<object>;
    dynamicData?: any;
    metadata?: Promise<IModelMetadata>;
    onChangeData?: IContextOnChangeData;
}

const DataContextProvider: FC<PropsWithChildren<IDataContextProviderProps>> = ({ children, ...props }) => {
    
    const { id, name, description, type = 'custom', initialData, metadata, dynamicData } = props;

    const { onChangeContext, getDataContextData, onChangeContextData } = useDataContextManager();
    const metadataDispatcher = useMetadataDispatcher();

    const onChangeData = useRef<IContextOnChangeData>(props.onChangeData);

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
        const data = setValueByPropertyName({...getDataContextData(props.id) ?? {}}, name, value, true);
        const changedData = setValueByPropertyName({}, name, value);

        if (onChangeData.current)
            onChangeData.current(data, changedData);
        onChangeContextData(props.id, data);
    };

    const setData = (data: any) => {
        if (onChangeData.current)
            onChangeData.current({...data}, {...data});
        onChangeContextData(props.id, {...data});
    };

    const getData = () => {
        return {...getDataContextData(props.id)} ?? {};
    };

    const updateApi = (api: object) => {
        if (!state.api) {
            setState({...state, api});
            onChangeContext({
                id,
                name,
                description,
                type,
                parentId: parentContext?.id,
                ...actionContext,
                api
            });
        }
    };

    const updateOnChangeData = (func: IContextOnChangeData) => {
        onChangeData.current = func;
    };

    const actionContext ={
        setFieldValue,
        getFieldValue,
        setData,
        getData,
        updateApi,
        updateOnChangeData
    };

    useDataContextRegister({
        id,
        name,
        description,
        type,
        parentId: parentContext?.id,
        initialData: {},
        ...actionContext,
        api: state.api
    }, []);

    useDeepCompareEffect(() => {
        if (dynamicData) {
            if (onChangeData.current)
                onChangeData.current(dynamicData, dynamicData);
            onChangeContextData(props.id, dynamicData);
        }
    }, [dynamicData]);

    useEffect(() => {
        initialData?.then(res => {
            if (onChangeData.current)
                onChangeData.current(res, res);
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
            ...actionContext,
            api: state.api
        });
    }, [name, description]);

    metadataDispatcher?.registerModel(id, metadata);

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