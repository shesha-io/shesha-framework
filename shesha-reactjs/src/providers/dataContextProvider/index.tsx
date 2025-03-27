import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher, } from "@/providers";
import React, { FC, PropsWithChildren, useRef, useState } from "react";
import { useDataContextManager } from "../dataContextManager/index";
import {  DataContextType, ContextOnChangeData, ContextGetFull } from "./contexts";
import DataContextBinder from "./dataContextBinder";
import { setValueByPropertyName } from "@/utils/object";
import { useAvailableConstantsData } from "../form/utils";
import { IStorageProxy, StorageProxy } from "./contexts/storageProxy";

export interface IDataContextProviderProps { 
  id: string;
  name: string;
  description?: string;
  type: DataContextType;
  initialData?: Promise<any>;
  metadata?: Promise<IModelMetadata>;
  onChangeData?: ContextOnChangeData;
  onChangeAction?: IConfigurableActionConfiguration;
  onInitAction?: IConfigurableActionConfiguration;
}

export const DataContextProvider: FC<PropsWithChildren<IDataContextProviderProps>> = (props) => {
  const {
    children,
    id,
    name, 
    description, 
    type, 
    initialData,
    metadata,
  } = props;

  const { onChangeContextData } = useDataContextManager();
  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useRef<any>({});
  allData.current = useAvailableConstantsData({ topContextId: id });

  const [storage] = useState<IStorageProxy>(() => new StorageProxy(() => onChangeContextData()));
  const initialDataRef = useRef<any>(undefined);

  const onChangeData = useRef<ContextOnChangeData>();
  if (props.onChangeData) {
    onChangeData.current = props.onChangeData;
  }

  const getFieldValue = (name: string) => {
    return storage.getFieldValue(name);
  };

  const getData = () => {
    return storage.getData();
  };

  let onChangeAction = null;

  const setFieldValue = (name: string, value: any) => {
    storage.setFieldValue(name, value);
    const changedData = setValueByPropertyName({}, name, value, false);
    
    onChangeAction(changedData);
  };

  const getFull: ContextGetFull = () => {
    return getData();
  };

  onChangeAction = (changedData: any) => {
    if (props.onChangeAction?.actionName) {
      const data = {...allData.current};
      // update self
      data.contexts[name] = getFull();
      executeAction({
        actionConfiguration: props.onChangeAction,
        argumentsEvaluationContext: {...allData.current, changedData},
      });
    }
  };

  const setDataInternal = (changedData: any) => {
    storage.setData(changedData);

    if (onChangeData.current)
      onChangeData.current(changedData, changedData);
};

  const setData = (changedData: any) => {
    setDataInternal(changedData);
    onChangeAction(changedData);
  };

  if (initialData && initialDataRef.current === undefined) {
    initialDataRef.current = initialData;
    initialData.then((data) => {
      setDataInternal(data);
      executeAction({
        actionConfiguration: props.onInitAction,
        argumentsEvaluationContext: {...allData.current},
      });
    });
  }

  return (
    <DataContextBinder
      id={id}
      name={name}
      description={description}
      type={type}
      data={storage}
      metadata={metadata}
      setFieldValue={setFieldValue}
      getFieldValue={getFieldValue}
      setData={setData}
      getData={getData}
    >
      {children}
    </DataContextBinder>
  );
};