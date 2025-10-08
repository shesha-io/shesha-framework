import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher } from "@/providers";
import React, { PropsWithChildren, useRef } from "react";
import { useDataContextManagerActions } from "../dataContextManager/index";
import { DataContextType, ContextOnChangeData, ContextSetFieldValue } from "./contexts";
import DataContextBinder from "./dataContextBinder";
import { setValueByPropertyName } from "@/utils/object";
import { IApplicationContext, useAvailableConstantsDataNoRefresh } from "../form/utils";
import { IShaDataWrapper } from "./contexts/shaDataAccessProxy";
import { IAnyObject } from "@/interfaces";
import { Path } from "@/utils/dotnotation";
import { GetShaDataContextAccessor, useShaDataContextAccessor } from "./contexts/contextDataAccessor";
import { WebStorageType } from "./contexts/webStorageProxy";

export interface IDataContextProviderProps<TData extends object> {
  id: string;
  name: string;
  description?: string | undefined;
  type: DataContextType;
  webStorageType?: WebStorageType;
  initialData?: Promise<TData> | undefined;
  metadata?: Promise<IModelMetadata> | undefined;
  onChangeData?: ContextOnChangeData | undefined;
  onChangeAction?: IConfigurableActionConfiguration | undefined;
  onInitAction?: IConfigurableActionConfiguration | undefined;
  getShaDataContextAccessor?: GetShaDataContextAccessor<TData>;
}

export const DataContextProvider = <TData extends object = object>(props: PropsWithChildren<IDataContextProviderProps<TData>>): React.ReactElement => {
  const {
    children,
    id,
    name,
    description,
    type,
    webStorageType,
    initialData,
    metadata,
    getShaDataContextAccessor,
  } = props;

  const { onChangeContextData } = useDataContextManagerActions();
  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useRef<IApplicationContext>(undefined);
  allData.current = useAvailableConstantsDataNoRefresh({ topContextId: id });

  const setDataInternal = (changedData: TData): void => {
    storage.setData(changedData);

    if (onChangeData.current)
      onChangeData.current(changedData, changedData);
  };

  const setFieldValue: ContextSetFieldValue<TData> = (name, value): void => {
    const partial = setValueByPropertyName({} as TData, name.toString(), value, false) as Partial<TData>;
    onChangeAction(partial);
    onChangeContextData();
  };

  const setData = (changedData: TData): void => {
    if (onChangeData.current)
      onChangeData.current(storage.getData(), changedData);
    onChangeAction(changedData);
    onChangeContextData();
  };

  const storage = useShaDataContextAccessor<TData>(id, setFieldValue, setData, webStorageType, getShaDataContextAccessor);

  const initialDataRef = useRef<IAnyObject>(undefined);

  const onChangeData = useRef<ContextOnChangeData>();
  if (props.onChangeData) {
    onChangeData.current = props.onChangeData;
  }

  const getFieldValue = (name: string): unknown => {
    return storage.getFieldValue(name as Path<TData>);
  };

  const getData = (): IShaDataWrapper<TData> => {
    return storage as IShaDataWrapper<TData>;
  };

  const onChangeAction = (changedData: Partial<TData>): void => {
    if (props.onChangeAction?.actionName) {
      executeAction({
        actionConfiguration: props.onChangeAction,
        argumentsEvaluationContext: { ...allData.current, changedData },
      });
    }
  };

  if (initialData && initialDataRef.current === undefined) {
    initialDataRef.current = initialData;
    initialData.then((data) => {
      setDataInternal(data);
      if (props.onInitAction) {
        executeAction({
          actionConfiguration: props.onInitAction,
          argumentsEvaluationContext: { ...allData.current },
        });
      }
    });
  }

  return (
    <DataContextBinder<TData>
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
