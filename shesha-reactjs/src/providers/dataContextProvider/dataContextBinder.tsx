import React, { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, MetadataProvider, useConfigurableActionDispatcher, useMetadataDispatcher } from "@/providers";
import { useDataContextManager, useDataContextRegister } from "@/providers/dataContextManager";
import { getValueByPropertyName, setValueByPropertyName } from "@/utils/object";
import { useAvailableConstantsData } from '@/providers/form/utils';
import { IApplicationContext } from '@/providers/form/utils';
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
  IDataContextProviderActionsContextOverride,
  IDataContextProviderStateContext,
  useDataContext 
} from "./contexts";
import ConditionalWrap from "@/components/conditionalWrapper/index";

export interface IDataContextBinderProps { 
  id: string;
  name: string;
  description?: string;
  type: DataContextType;
  data?: any;
  api?: any;
  metadata?: Promise<IModelMetadata>;
  getData?: ContextGetData;
  getFieldValue?: ContextGetFieldValue;
  setData?: ContextSetData;
  setFieldValue?: ContextSetFieldValue;
  onSetData?: ContextSetData;
  onChangeAction?: IConfigurableActionConfiguration;
  actionsOverride?: IDataContextProviderActionsContextOverride;
}

const DataContextBinder: FC<PropsWithChildren<IDataContextBinderProps>> = (props) => {
  const {
    children,
    id,
    name, 
    description, 
    type, 
    data,
  } = props;

  const { onChangeContext, onChangeContextData } = useDataContextManager();
  const metadataDispatcher = useMetadataDispatcher();
  const allData = useRef<IApplicationContext>();
  allData.current = useAvailableConstantsData(id);

  const { executeAction } = useConfigurableActionDispatcher();

  const onSetData = useRef<ContextOnChangeData>();
  if (props.onSetData) {
    onSetData.current = props.onSetData;
  }

  const apiRef = useRef<any>();
  if (props.api) {
    apiRef.current = props.api;
  }

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

  const onChangeAction = (changedData: any) => {
    if (props.onChangeAction) {
      executeAction({
        actionConfiguration: props.onChangeAction,
        argumentsEvaluationContext: {...allData.current, changedData},
      });
    }
  };

  const getFieldValue = (name: string) => {
    if (props.getFieldValue)
      return props.getFieldValue(name);

    if (data)
      return getValueByPropertyName(data, name);
    else
      return undefined;
  };

  const getData = () => {
    if (props.getData)
      return props.getData();

    return data ?? {};
  };

  const setFieldValue = (name: string, value: any) => {
    if (props.setFieldValue)
      return props.setFieldValue(name, value, onChangeContextData);

    const changedData = setValueByPropertyName({}, name, value);

    if (onSetData.current)
      onSetData.current(changedData, onChangeContextData);

    onChangeAction(changedData);
  };

  const setData = (changedData: any) => {
    if (props.setData)
      return props.setData(changedData,  onChangeContextData);

    if (onSetData.current)
      onSetData.current({...changedData}, onChangeContextData);
    onChangeAction(changedData);
  };

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
    // need to update `data` object to use inside code editor
    const setFieldValueinternal = (name: string, value: any) => {
      setFieldValue(name, value);
      setValueByPropertyName(data, name, value, false);
    };
    data.setFieldValue = setFieldValueinternal;
    return data;
  };

  const updateOnSetData = (func: ContextOnChangeData) => {
    onSetData.current = func;
  };

  const actionContext ={
    setFieldValue,
    getFieldValue,
    setData,
    getData,
    getFull,
    updateApi,
    getApi,
    updateOnSetData,
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
      condition={!!props.metadata}
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