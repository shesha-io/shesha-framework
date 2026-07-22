import { setValueByPropertyName } from "@/utils/object";
import { useState } from "react";
import { CreateDataAccessor, IShaDataAccessor, IShaDataWrapper } from "./shaDataAccessProxy";
import { ContextSetData, ContextSetFieldValue, RefreshContext } from "../contexts";
import { useShaRouting } from "@/providers/shaRouting";
import { useWebStorage } from "@/hooks";
import { useEffectOnce } from "react-use";
import { WebStorageType } from "./webStorageProxy";

export type GetShaDataContextAccessor<TData extends object = object> = (
  onChangeCallback: RefreshContext<TData>,
  initialData?: TData,
  setStorageData?: (data: TData) => void,
) => IShaDataAccessor<TData>;

export const GetShaContextDataAccessor = <TData extends object = object>(
  onChangeCallback: RefreshContext<TData>,
  initialData?: TData,
  setStorageData?: (data: TData) => void,
): IShaDataAccessor<TData> => {
  let data: TData = initialData ?? {} as TData;

  const setFieldValue: ContextSetFieldValue<TData> = (propertyName, value, refreshContext): void => {
    setValueByPropertyName(data, propertyName.toString(), value);
    setStorageData?.(data);
    if (refreshContext)
      refreshContext(data);
    else
      onChangeCallback(data);
  };

  const setData: ContextSetData<TData> = (inputData: TData, refreshContext): void => {
    if (data !== inputData) {
      data = inputData;
      if (refreshContext)
        refreshContext(data);
      else
        onChangeCallback(data);
    }
    setStorageData?.(data);
  };

  return CreateDataAccessor(() => data, setData, setFieldValue);
};

const emptyData = {};

export const useShaDataContextAccessor = <TData extends object = object>(
  id: string,
  onChangeCallback: RefreshContext<TData>,
  webStorageType?: WebStorageType,
  getShaDataContextAccessor?: GetShaDataContextAccessor<TData>,
): IShaDataWrapper<TData> => {
  const shaRouter = useShaRouting();
  const path = shaRouter.router.path;
  const key = Boolean(webStorageType)
    ? webStorageType === 'sessionStorage'
      ? `${id}:${path}`
      // localStorage stores data for all paths
      : id
    : 'no-key';

  const needStore = Boolean(webStorageType);

  const [storedData, setStorageData] = useWebStorage(webStorageType ?? 'sessionStorage', key, emptyData as TData);

  const getDataContextAccessor: () => IShaDataWrapper<TData> = () =>
    typeof getShaDataContextAccessor === 'function'
      ? getShaDataContextAccessor(
        onChangeCallback,
        needStore ? storedData : undefined,
        needStore ? setStorageData : undefined,
      ) as IShaDataWrapper<TData>
      : GetShaContextDataAccessor<TData>(
        onChangeCallback,
        needStore ? storedData : undefined,
        needStore ? setStorageData : undefined,
      ) as IShaDataWrapper<TData>;

  const [storage] = useState<IShaDataWrapper<TData>>(() => getDataContextAccessor());

  // reset context data on unmount
  useEffectOnce(() => () => {
    if (needStore) storage.setData(emptyData as TData);
  });

  return storage;
};
