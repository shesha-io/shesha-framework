import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, } from "@/providers";
import React, { FC, PropsWithChildren, useEffect, useRef } from "react";
import {  DataContextType, ContextOnChangeData, RefreshContext } from "./contexts";
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

const DataContextProvider: FC<PropsWithChildren<IDataContextProviderProps>> = (props) => {
    
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

    const dataRef = useRef<any>();

    const onChangeData = useRef<ContextOnChangeData>();
    if (props.onChangeData) {
      onChangeData.current = props.onChangeData;
    }
  
    useEffect(() => {
      if (initialData) {
        initialData.then((data) => {
          dataRef.current = data;
        });
      }
    }, [initialData]);

    const getData = () => {
      return {...dataRef.current};
    };

    const onChangeDataInteranl = (data: any, changedData: any, refreshContext?: RefreshContext) => {
      dataRef.current = data;

      if (onChangeData.current)
        onChangeData.current({...dataRef.current, ...changedData}, {...changedData}, refreshContext);
    };

    const updateOnChangeData = (func: ContextOnChangeData) => {
      onChangeData.current = func;
    };
  
    return (
      <DataContextBinder
        id={id}
        name={name}
        description={description}
        type={type}
        data={dataRef.current}
        metadata={metadata}
        onChangeData={onChangeDataInteranl}
        getData={getData}
        onChangeAction={onChangeAction}
        actionsOverride={{updateOnChangeData}}
      >
        {children}
      </DataContextBinder>
    );
};

export default DataContextProvider;