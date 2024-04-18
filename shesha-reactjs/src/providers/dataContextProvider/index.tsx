import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, } from "@/providers";
import React, { FC, PropsWithChildren, useEffect, useRef } from "react";
import { useDataContextManager } from "../dataContextManager/index";
import {  DataContextType, ContextOnChangeData } from "./contexts";
import DataContextBinder from "./dataContextBinder";

export interface IDataContextProviderProps { 
  id: string;
  name: string;
  description?: string;
  type: DataContextType;
  initialData?: Promise<object>;
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
    onChangeAction,
  } = props;

  const { onChangeContextData } = useDataContextManager();
  const dataRef = useRef<any>(undefined);
  const initialDataRef = useRef<any>(undefined);

  const onChangeData = useRef<ContextOnChangeData>();
  if (props.onChangeData) {
    onChangeData.current = props.onChangeData;
  }
    useEffect(() => {
      if (initialData && initialDataRef.current === undefined) {
        initialData.then((data) => {
          initialDataRef.current = data ?? null;
          dataRef.current = data;
        });
      }
    }, [initialData]);

    const getData = () => {
      return {...dataRef.current};
    };

    const onSetDataInteranl = (changedData: any) => {
      dataRef.current = {...dataRef.current, ...changedData};

      if (onChangeData.current)
        onChangeData.current({...dataRef.current}, {...changedData});
      
      onChangeContextData();
    };

    return (
      <DataContextBinder
        id={id}
        name={name}
        description={description}
        type={type}
        data={dataRef.current}
        metadata={metadata}
        onSetData={onSetDataInteranl}
        getData={getData}
        onChangeAction={onChangeAction}
      >
        {children}
      </DataContextBinder>
    );
};