import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher, } from "@/providers";
import React, { FC, PropsWithChildren, useRef } from "react";
import { useDataContextManager } from "../dataContextManager/index";
import {  DataContextType, ContextOnChangeData, ContextGetFull } from "./contexts";
import DataContextBinder from "./dataContextBinder";
import { getValueByPropertyName, setValueByPropertyName } from "@/utils/object";
import { useAvailableConstantsData } from "../form/utils";

export interface IDataContextProviderProps { 
  id: string;
  name: string;
  description?: string;
  type: DataContextType;
  initialData?: Promise<any>;
  metadata?: Promise<IModelMetadata>;
  onChangeData?: ContextOnChangeData;
  onChangeAction?: IConfigurableActionConfiguration;
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
  allData.current = useAvailableConstantsData(id);

  const dataRef = useRef<any>({});
  const initialDataRef = useRef<any>(undefined);

  const onChangeData = useRef<ContextOnChangeData>();
  if (props.onChangeData) {
    onChangeData.current = props.onChangeData;
  }

  const getFieldValue = (name: string) => {
    return getValueByPropertyName(dataRef.current, name);
  };

  const getData = () => {
    return dataRef.current;
  };

  let onChangeAction = null;

  const setFieldValue = (name: string, value: any) => {
    setValueByPropertyName(dataRef.current, name, value, false);
    const changedData = setValueByPropertyName({}, name, value, false);
    
    onChangeContextData();
    onChangeAction(changedData);
  };

  const getFull: ContextGetFull = () => {
    const data = getData();
    // need to update `data` object to use inside code editor
    const setFieldValueinternal = (name: string, value: any) => {
      setFieldValue(name, value);
    };
    data.setFieldValue = setFieldValueinternal;
    return data;
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

  const setDatainternal = (changedData: any) => {
    dataRef.current = {...dataRef.current, ...changedData};

    if (onChangeData.current)
      onChangeData.current({...dataRef.current}, {...changedData});

      onChangeContextData();
    };

  const setData = (changedData: any) => {
    setDatainternal(changedData);
    onChangeAction(changedData);
  };

  if (initialData && initialDataRef.current === undefined) {
    initialDataRef.current = initialData;
    initialData.then((data) => {
      setDatainternal(data);
    });
  }

  return (
    <DataContextBinder
      id={id}
      name={name}
      description={description}
      type={type}
      data={dataRef.current}
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