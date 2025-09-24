import { IModelMetadata } from "@/interfaces/metadata";
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher } from "@/providers";
import React, { PropsWithChildren, useRef } from "react";
import { useDataContextManagerActions } from "../dataContextManager/index";
import { DataContextType, ContextOnChangeData, ContextSetFieldValue } from "./contexts";
import DataContextBinder from "./dataContextBinder";
import { setValueByPropertyName } from "@/utils/object";
import { IApplicationContext, useAvailableConstantsDataNoRefresh } from "../form/utils";
import { GetShaContextDataAccessor, IShaDataAccessor } from "./contexts/shaDataAccessProxy";
import { IAnyObject } from "@/interfaces";
import { isDefined } from "@/configuration-studio/types";
import { Path } from "@/utils/dotnotation";

export interface IDataContextProviderProps<TData extends object> {
  id: string;
  name: string;
  description?: string | undefined;
  type: DataContextType;
  initialData?: Promise<TData> | undefined;
  metadata?: Promise<IModelMetadata> | undefined;
  onChangeData?: ContextOnChangeData | undefined;
  onChangeAction?: IConfigurableActionConfiguration | undefined;
  onInitAction?: IConfigurableActionConfiguration | undefined;
}

export const DataContextProvider = <TData extends object = object>(props: PropsWithChildren<IDataContextProviderProps<TData>>): React.ReactElement => {
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
  const allData = useRef<IApplicationContext>(undefined);
  allData.current = useAvailableConstantsDataNoRefresh({ topContextId: id });

  const storage = useRef<IShaDataAccessor<TData>>(GetShaContextDataAccessor<TData>(onChangeContextData));

  const initialDataRef = useRef<IAnyObject>(undefined);

  const onChangeData = useRef<ContextOnChangeData>();
  if (props.onChangeData) {
    onChangeData.current = props.onChangeData;
  }

  const getFieldValue = (name: string): unknown => {
    return storage.current.getFieldValue(name as Path<TData>);
  };

  const getData = (): IShaDataAccessor<TData> => {
    return storage.current;
  };

  const onChangeAction = (changedData: Partial<TData>): void => {
    if (props.onChangeAction?.actionName) {
      const data = { ...allData.current };
      // TODO: Alex, please check this assignment
      // update self
      const { contexts } = data;
      if (isDefined(contexts))
        contexts[name] = getData();
      executeAction({
        actionConfiguration: props.onChangeAction,
        argumentsEvaluationContext: { ...allData.current, changedData },
      });
    }
  };

  const setFieldValue: ContextSetFieldValue<TData> = (name, value): void => {
    storage.current.setFieldValue(name, value);
    const partial = setValueByPropertyName({} as TData, name.toString(), value, false) as Partial<TData>;
    onChangeAction(partial);
  };

  const setDataInternal = (changedData: TData): void => {
    storage.current.setData(changedData);

    if (onChangeData.current)
      onChangeData.current(changedData, changedData);
  };

  const setData = (changedData: TData): void => {
    setDataInternal(changedData);
    onChangeAction(changedData);
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
      // data={storage} - review types
      metadata={metadata}
      setFieldValue={setFieldValue}
      getFieldValue={getFieldValue}
      setData={setData}
      // getData={getData} - review types
    >
      {children}
    </DataContextBinder>
  );
};
