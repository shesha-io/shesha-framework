import { useDeepCompareEffect } from "@/hooks/useDeepCompareEffect";
import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, MetadataProvider, useConfigurableActionDispatcher, useMetadataDispatcher } from "@/providers";
import { useDataContextManager, useDataContextRegister } from "@/providers/dataContextManager";
import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { createContext } from 'react';
import { setValueByPropertyName } from "@/utils/object";
import { getFieldNameFromExpression, IApplicationContext, useApplicationContext } from "@/utils/publicUtils";

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
    onChangeAction?: IConfigurableActionConfiguration;
}

const DataContextProvider: FC<PropsWithChildren<IDataContextProviderProps>> = ({ children, id, ...props }) => {
    
    const { name, description, type = 'custom', initialData, metadata, dynamicData } = props;

    const { onChangeContext, onUpdateContextApi, getDataContextData, onChangeContextData } = useDataContextManager();
    const metadataDispatcher = useMetadataDispatcher();
    const allData = useRef<IApplicationContext>();
    allData.current = useApplicationContext(id);

    const { executeAction } = useConfigurableActionDispatcher();

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
        const data = getDataContextData(id);
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
        const data = setValueByPropertyName({...getDataContextData(id) ?? {}}, name, value, true);
        const changedData = setValueByPropertyName({}, name, value);

        if (onChangeData.current)
            onChangeData.current(data, changedData);
        onChangeContextData(id, data);

        onChangeAction(changedData);
    };

    const setData = (data: any) => {
        if (onChangeData.current)
            onChangeData.current({...data}, {...data});
        onChangeContextData(id, {...data});

        onChangeAction(data);
    };

    const onChangeAction = (changedData: any) => {
        if (props.onChangeAction) {
          executeAction({
            actionConfiguration: props.onChangeAction,
            argumentsEvaluationContext: {...allData.current, changedData},
          });
        }
    };

    const getData = () => {
        return {...getDataContextData(id)} ?? {};
    };

    const updateApi = (api: any) => {
        onUpdateContextApi(id, api);
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
    }, []);

    useDeepCompareEffect(() => {
        if (dynamicData) {
            if (onChangeData.current)
                onChangeData.current(dynamicData, dynamicData);
            onChangeContextData(id, dynamicData);
        }
    }, [dynamicData]);

    useEffect(() => {
        initialData?.then(res => {
            if (onChangeData.current)
                onChangeData.current(res, res);
            onChangeContextData(id, res);
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