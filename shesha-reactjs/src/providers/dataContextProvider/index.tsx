import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher, } from "@/providers";
import React, { FC, PropsWithChildren, useRef } from "react";
import { useDataContextManagerActions } from "../dataContextManager/index";
import { DataContextType, ContextOnChangeData, ContextGetFull } from "./contexts";
import DataContextBinder from "./dataContextBinder";
import { setValueByPropertyName } from "@/utils/object";
import { useAvailableConstantsDataNoRefresh } from "../form/utils";
import { GetShaContextDataAccessor, IShaDataAccessor } from "./contexts/shaDataAccessProxy";

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

  const { onChangeContextData } = useDataContextManagerActions();
  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useRef<any>({});
  allData.current = useAvailableConstantsDataNoRefresh({ topContextId: id });

  const storage = useRef<IShaDataAccessor>(GetShaContextDataAccessor(onChangeContextData));// CreateStorageProperty(onChangeContextData));

  const initialDataRef = useRef<any>(undefined);

  const onChangeData = useRef<ContextOnChangeData>();
  if (props.onChangeData) {
    onChangeData.current = props.onChangeData;
  }

  const getFieldValue = (name: string) => {
    return storage.current.getFieldValue(name);
  };

  const getData = () => {
    return storage.current;
  };

  let onChangeAction = null;

  const setFieldValue = (name: string, value: any) => {
    storage.current.setFieldValue(name, value);
    onChangeAction(setValueByPropertyName({}, name, value, false));
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
    storage.current.setData(changedData);

    if (onChangeData.current)
      onChangeData.current(changedData, changedData);
};

  const setData = (changedData: any) => {
    setDataInternal(changedData);
    onChangeAction(changedData);
    //fireListeners();
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
      //listenersRef={dataBinderRef}
    >
      {children}
    </DataContextBinder>
  );
};