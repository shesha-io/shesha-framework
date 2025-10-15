import React, { PropsWithChildren, useCallback, useEffect, useId, useRef, useState } from "react";
import { IModelMetadata } from "@/interfaces/metadata";
import { MetadataProvider, useMetadataDispatcher } from "@/providers";
import { useDataContextManagerActions, useDataContextRegister } from "@/providers/dataContextManager";
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
  IDataContextFull,
  IDataContextProviderActionsContext,
  IDataContextProviderActionsContextOverride,
  IDataContextProviderStateContext,
  useDataContextOrUndefined,
} from "./contexts";
import ConditionalWrap from "@/components/conditionalWrapper/index";
import { useDeepCompareCallback } from "@/hooks/useDeepCompareEffect";
import { isEmpty } from "lodash";
import { isDefined } from "@/utils/nullables";
import { Path } from "@/utils/dotnotation";

export interface IDataContextBinderRef {
  fireListener: (propertyName: string) => void;
  fireAllListeners: () => void;
}

export interface IDataContextBinderProps<TData extends object = object> {
  id: string;
  name: string;
  description?: string | undefined;
  type: DataContextType;
  data?: TData | undefined;
  api?: unknown | undefined;
  metadata?: Promise<IModelMetadata> | undefined;
  distributeMetadata?: boolean | undefined;
  getData?: ContextGetData<TData> | undefined;
  getFieldValue?: ContextGetFieldValue | undefined;
  setData?: ContextSetData<TData> | undefined;
  setFieldValue?: ContextSetFieldValue<TData> | undefined;
  onChangeData?: ContextOnChangeData | undefined;
  actionsOverride?: IDataContextProviderActionsContextOverride | undefined;
}

const DataContextBinder = <TData extends object = object>(props: PropsWithChildren<IDataContextBinderProps<TData>>): React.ReactElement => {
  const {
    children,
    id,
    name,
    description,
    type,
    data,
    onChangeData,
    getFieldValue: propsGetFieldValue,
  } = props;

  const uid = useId();
  const { onChangeContext, onChangeContextData } = useDataContextManagerActions();
  const metadataDispatcher = useMetadataDispatcher();

  const apiRef = useRef<unknown>(props.api);

  // update api if presented in the props (another way - leave props.api empty and call updateApi method)
  if (!isEmpty(props.api))
    apiRef.current = props.api;

  // use ref to get actual data value inside methods
  const dataRef = useRef<TData>();
  dataRef.current = data;

  const parentContext = useDataContextOrUndefined();
  const [state, setState] = useState<IDataContextProviderStateContext>(() => ({
    id,
    uid: uid,
    name,
    description,
    type,
    parentDataContext: parentContext,
    metadata: props.metadata ?? Promise.resolve({ ...DEFAULT_CONTEXT_METADATA, name, properties: [] } as IModelMetadata), // set default metadata if empty
  }));

  const metadata = props.metadata ?? state.metadata;

  const getFieldValue = useCallback((name: string) => {
    if (propsGetFieldValue)
      return propsGetFieldValue(name);

    if (dataRef.current)
      return getValueByPropertyName(dataRef.current, name as Path<TData>);
    else
      return undefined;
  }, [propsGetFieldValue]);

  const getData = useDeepCompareCallback(() => {
    if (props.getData)
      return props.getData();

    return dataRef.current ?? {};
  }, [props.getData]);

  const setFieldValue = useDeepCompareCallback<ContextSetFieldValue<TData>>((name, value) => {
    if (props.setFieldValue) {
      props.setFieldValue(name, value, onChangeContextData);
    } else {
      const newData = setValueByPropertyName({ ...dataRef.current ?? {} }, name.toString(), value, true);
      const changedData = setValueByPropertyName({}, name.toString(), value);

      if (onChangeData)
        onChangeData(newData, changedData, onChangeContextData);
    }
  }, [props.setFieldValue, onChangeData]);

  const setData = useDeepCompareCallback<ContextSetData<TData>>((changedData, _refresh) => {
    if (props.setData)
      props.setData(changedData as TData, onChangeContextData);
    else if (onChangeData)
      onChangeData({ ...dataRef.current, ...changedData }, { ...changedData }, onChangeContextData);
  }, [props.setData, onChangeData]);

  const updateApi = (api: unknown): void => {
    apiRef.current = api;
  };

  const getApi = (): unknown => {
    return apiRef.current;
  };

  const getFull: ContextGetFull = () => {
    const data: IDataContextFull = getData();
    const api = getApi();
    if (api)
      data.api = api;
    return data;
  };

  const actionContext: IDataContextProviderActionsContext = {
    setFieldValue: setFieldValue as unknown as ContextSetFieldValue, // TODO: review and replace with a proper type
    getFieldValue,
    setData: setData as unknown as ContextSetData, // TODO: review and replace with a proper type
    getData,
    getFull,
    updateApi,
    getApi,
    ...props.actionsOverride,
  };

  useDataContextRegister({
    id,
    uid,
    name,
    description,
    type,
    parentUid: parentContext?.uid,
    ...actionContext,
  }, []);

  useEffect(() => {
    setState({ ...state, metadata });
    metadata.then((res) => {
      onChangeContext({
        id,
        uid,
        name,
        description,
        type,
        metadata: res,
        parentUid: parentContext?.uid,
        ...actionContext,
      });
    });
    metadataDispatcher.updateModel(id, metadata);
    // TODO: Alex, please review. List of dependencise shouls be full or there should be a function that updates metadata only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata]);

  useEffect(() => {
    onChangeContext({
      id,
      uid,
      name,
      description,
      type,
      parentUid: parentContext?.uid,
      ...actionContext,
    });
    // TODO: Alex, please review. List of dependencise shouls be full or there should be a function that updates name and description only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description]);

  metadataDispatcher.registerModel(id, metadata);

  return (
    <ConditionalWrap
      condition={isDefined(props.metadata) && (props.distributeMetadata ?? false)}
      wrap={(children) => <MetadataProvider id={id} modelType={id} dataType="context"> {children} </MetadataProvider>}
    >
      <DataContextProviderActionsContext.Provider value={actionContext}>
        <DataContextProviderStateContext.Provider value={state}>
          <>{children}</>
        </DataContextProviderStateContext.Provider>
      </DataContextProviderActionsContext.Provider>
    </ConditionalWrap>
  );
};

export default DataContextBinder;
