import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher } from "@/providers";
import React, { PropsWithChildren, useRef } from "react";
import { DataContextType, ContextOnChangeData, ContextSetFieldValue, RefreshContext } from "./contexts";
import DataContextBinder from "./dataContextBinder";
import { setValueByPropertyName } from "@/utils/object";
import { useAvailableConstantsDataNoRefresh } from "../form/utils";
import { IShaDataWrapper } from "./contexts/shaDataAccessProxy";
import { Path } from "@/utils/dotnotation";
import { GetShaDataContextAccessor, useShaDataContextAccessor } from "./contexts/contextDataAccessor";
import { WebStorageType } from "./contexts/webStorageProxy";
import { useDataContextManagerActions } from "../dataContextManager/hooks";

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
    onChangeData,
    getShaDataContextAccessor,
  } = props;

  const { onChangeContextData } = useDataContextManagerActions();
  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useAvailableConstantsDataNoRefresh({ topContextId: id });
  const initialDataRef = useRef<Promise<TData> | undefined>(undefined);

  const onChangeAction = (changedData?: Partial<TData>): void => {
    if (props.onChangeAction?.actionName) {
      void executeAction({
        actionConfiguration: props.onChangeAction,
        argumentsEvaluationContext: { ...allData, changedData },
      });
    }
  };

  const onChange: RefreshContext<TData> = (data?: Partial<TData>): void => {
    if (onChangeData)
      onChangeData(data as TData, data as TData);
    onChangeAction(data);
    onChangeContextData(data);
  };

  const storage = useShaDataContextAccessor<TData>(id, onChange, webStorageType, getShaDataContextAccessor);

  const setFieldValue: ContextSetFieldValue<TData> = (name, value): void => {
    storage.setFieldValue(name, value, () => {
      const partial = setValueByPropertyName({} as TData, name.toString(), value, false) as Partial<TData>;
      if (onChangeData)
        onChangeData(partial, partial);
      onChangeAction(partial);
      onChangeContextData(partial);
    });
  };

  const setData = (changedData: TData): void => {
    storage.setData(changedData, () => {
      if (onChangeData)
        onChangeData(storage.getData(), changedData);
      onChangeAction(changedData);
      onChangeContextData(changedData);
    });
  };

  const getFieldValue = (name: string): unknown => {
    return storage.getFieldValue(name as Path<TData>);
  };

  const getData = (): IShaDataWrapper<TData> => {
    return storage as IShaDataWrapper<TData>;
  };

  if (initialData && initialDataRef.current === undefined) {
    initialDataRef.current = initialData;
    initialData
      .then((data) => {
        storage.setData(data, () => {
          if (onChangeData)
            onChangeData(data, data);
          onChangeContextData(data);
        });
        if (props.onInitAction) {
          void executeAction({
            actionConfiguration: props.onInitAction,
            argumentsEvaluationContext: { ...allData },
          });
        }
      })
      .catch((error) => {
        console.error('Failed to fetch initial data', error);
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
