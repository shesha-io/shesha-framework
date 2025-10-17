import React, { FC, PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { IModelMetadata } from "@/interfaces/metadata";
import { MetadataProvider, useMetadataDispatcher } from "@/providers";
import { useDataContextManager, useDataContextRegister } from "@/providers/dataContextManager";
import { getValueByPropertyName, setValueByPropertyName } from "@/utils/object";
import { DEFAULT_CONTEXT_METADATA } from "../dataContextManager/models";
import { 
  ContextGetData,
  ContextGetFieldValue,
  ContextGetFull,
  ContextOnChangeData,
  ContextSetData,
  ContextSetFieldValue,
  DataContextProviderActionsContext,
  DataContextProviderStateContext,
  DataContextType,
  IDataContextProviderActionsContext,
  IDataContextProviderActionsContextOverride,
  IDataContextProviderStateContext,
  useDataContext 
} from "./contexts";
import ConditionalWrap from "@/components/conditionalWrapper/index";
import { useDeepCompareCallback, useDeepCompareEffect } from "@/hooks/useDeepCompareEffect";

export interface IDataContextBinderProps { 
  id: string;
  name: string;
  description?: string;
  type: DataContextType;
  data?: any;
  api?: any;
  metadata?: Promise<IModelMetadata>;
  distributeMetadata?: boolean;
  getData?: ContextGetData;
  getFieldValue?: ContextGetFieldValue;
  setData?: ContextSetData;
  setFieldValue?: ContextSetFieldValue;
  onChangeData?: ContextOnChangeData;
  actionsOverride?: IDataContextProviderActionsContextOverride;
  includeSetFieldValue?: boolean;
}

const DataContextBinder: FC<PropsWithChildren<IDataContextBinderProps>> = (props) => {
  const {
    children,
    id,
    name, 
    description, 
    type, 
    data,
    onChangeData,
    includeSetFieldValue = true,
  } = props;

  const { onChangeContext, onChangeContextData } = useDataContextManager();
  const metadataDispatcher = useMetadataDispatcher();

  const apiRef = useRef<any>(props.api);
  
  // use ref to get actual data value inside methods
  const dataRef = useRef<any>();
  dataRef.current = data;
  useDeepCompareEffect(() => onChangeContextData(), [data]);

  const parentContext = useDataContext(false);
  const [state, setState] = useState<IDataContextProviderStateContext>({
    id,
    name,
    description,
    type,
    parentDataContext: parentContext,
    metadata: props.metadata ?? Promise.resolve({ ...DEFAULT_CONTEXT_METADATA, name, properties: []} as IModelMetadata) // set default metadata if empty
  });

  const metadata = props.metadata ?? state.metadata;

  const getFieldValue = useCallback((name: string) => {
    if (props.getFieldValue)
      return props.getFieldValue(name);

    if (dataRef.current)
      return getValueByPropertyName(dataRef.current, name);
    else
      return undefined;
  }, [props.getFieldValue]);

  const getData = useDeepCompareCallback(() => {
    if (props.getData)
      return props.getData();

    return dataRef.current ?? {};
  }, [props.getFieldValue]);

  const setFieldValue = useDeepCompareCallback((name: string, value: any) => {
    if (props.setFieldValue)
      return props.setFieldValue(name, value, onChangeContextData);

    const newData = setValueByPropertyName({...dataRef.current ?? {}}, name, value, true);
    const changedData = setValueByPropertyName({}, name, value);

    if (onChangeData)
      onChangeData(newData, changedData, onChangeContextData);

  }, [props.setFieldValue, onChangeData]);

  const setData = useDeepCompareCallback((changedData: any) => {
    if (props.setData)
      return props.setData(changedData,  onChangeContextData);

    if (onChangeData)
      onChangeData({...dataRef.current, ...changedData}, {...changedData}, onChangeContextData);
  }, [props.setData, onChangeData]);

  const updateApi = (api: any) => {
    apiRef.current = api;    
  };

  const getApi = () => {
    return apiRef.current;
  };

  const getFull: ContextGetFull = () => {
    const data = getData();
    const api = getApi();
    if (!!api) 
      data.api = api;
    if (includeSetFieldValue)
      data.setFieldValue = setFieldValue;
    return data;
  };

  const actionContext: IDataContextProviderActionsContext ={
    setFieldValue,
    getFieldValue,
    setData,
    getData,
    getFull,
    updateApi,
    getApi,
    ...props.actionsOverride,
  };

  useDataContextRegister({
    id,
    name,
    description,
    type,
    parentId: parentContext?.id,
    ...actionContext,
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
    <ConditionalWrap
      condition={props.metadata && (props.distributeMetadata ?? false)}
      wrap={children => <MetadataProvider id={id} modelType={id} dataType='context' > {children} </MetadataProvider>}
    >
      <DataContextProviderActionsContext.Provider value={{ ...actionContext }}>
        <DataContextProviderStateContext.Provider value={state}>
          <>{children}</> 
        </DataContextProviderStateContext.Provider>
      </DataContextProviderActionsContext.Provider>
    </ConditionalWrap>
  );
};

export default DataContextBinder;