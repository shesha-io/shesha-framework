import { setValueByPropertyName } from "@/utils/object";
import { FieldValueSetter } from '@/utils/dotnotation';
import { useEffect, useRef } from "react";
import { CreateDataAccessor, IShaDataAccessor, IShaDataWrapper } from "./shaDataAccessProxy";
import { DataContextType } from "../contexts";
import { useShaRouting } from "@/providers/shaRouting";
import { useWebStorage } from "@/hooks";

export type GetShaDataContextAccessor<TData extends object = object> = (onChange: () => void, initialData?: TData, setStorageData?: (data: TData) => void) => IShaDataAccessor<TData>;

export const GetShaContextDataAccessor = <TData extends object = object>(onChange: () => void, initialData?: TData, setStorageData?: (data: TData) => void): IShaDataAccessor<TData> => {
  let data: TData = initialData as TData;

  const saveWebStorage = (data: TData): void => {
    setStorageData?.(data);
  };

  const setFieldValue: FieldValueSetter<TData> = (propertyName, value): void => {
    setValueByPropertyName(data, propertyName.toString(), value);
    onChange();
    saveWebStorage(data);
  };

  const setData = (inputData: TData): void => {
    data = inputData;
    onChange();
    saveWebStorage(data);
  };

  return CreateDataAccessor(() => data, setData, setFieldValue);
};

export const useShaDataContextAccessor = <TData extends object = object>(
  onChangeContextData: () => void,
  type: DataContextType,
  getShaDataContextAccessor?: GetShaDataContextAccessor<TData>,
): IShaDataWrapper<TData> => {
  const storage = useRef<IShaDataWrapper<TData>>();

  const path = useShaRouting().router?.path;
  const key = `${type}:${path}`;

  const storageType = type === 'app' ? 'localStorage' : 'sessionStorage';
  const needStore = type === 'page' || type === 'form' || type === 'app';

  const [storedData, setStorageData] = useWebStorage(storageType, key, {} as TData);

  const getDataContextAccessor = typeof getShaDataContextAccessor === 'function'
    ? () => getShaDataContextAccessor(onChangeContextData, needStore ? storedData : undefined, needStore ? setStorageData : undefined) as IShaDataWrapper<TData>
    : () => GetShaContextDataAccessor<TData>(onChangeContextData, needStore ? storedData : undefined, needStore ? setStorageData : undefined) as IShaDataWrapper<TData>;

  storage.current = storage.current ?? getDataContextAccessor();

  useEffect(() => {
    // reset context data on unmount
    return () => {
      if (type === 'page' || type === 'form')
        storage.current?.setData({} as TData);
    };
  });

  return storage.current;
};
