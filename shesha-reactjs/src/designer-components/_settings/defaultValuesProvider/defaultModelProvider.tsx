import React, { createContext, PropsWithChildren, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { DefaultModelInstance, IDefaultModelInstance, IDefaultModelValueInfo } from './defaultModelInstance';

export interface IDefaultModelProviderProps<TData extends object = object> {
  name: string;
  defaultModel?: TData;
  model?: TData;
}

export interface IDefaultModelProviderState<TData extends object = object> {
  setDefaultModel: (name: string, model: TData) => void;
  setModel: (model: TData) => void;
  getMergedModel: () => TData;
  getModel: () => TData;
  getDefaultModel: (name?: string) => TData;
  // ToDo: AS - memoise getValueInfo
  getValueInfo: (propName: string) => IDefaultModelValueInfo;
  overrideValue: (propName: string) => void;
  setCurrentValueAdditionalInfo: (propName: string, additionalInfo: () => string | ReactElement) => void;
  getCurrentValueAdditionalInfo: (propName: string) => (() => string | ReactElement) | undefined;
}

const DefaultModelProviderStateContext = createContext<IDefaultModelProviderState<object>>(undefined);

export const useDefaultModelProviderStateOrUndefined = (): IDefaultModelProviderState<object> | undefined => useContext(DefaultModelProviderStateContext);

const DefaultModelProvider = <TData extends object = object>(props: PropsWithChildren<IDefaultModelProviderProps<TData>>): ReactElement => {
  const [, forceRefresh] = useState({});

  const valueInfo = useRef<Map<string, IDefaultModelValueInfo>>(new Map());
  const needUpdateInfo = useRef<Map<string, boolean>>(new Map());
  const instance = useRef<IDefaultModelInstance<TData>>(undefined);
  if (instance.current === undefined) {
    instance.current = new DefaultModelInstance<TData>();
  }

  useEffect(() => {
    if (props.model !== undefined)
      instance.current.setModel(props.model);
    if (props.defaultModel !== undefined)
      instance.current.setDefaultModel(props.name, props.defaultModel);
  }, [props.defaultModel, props.model]);

  const state: IDefaultModelProviderState<TData> = {
    setDefaultModel: (name: string, model: TData) => {
      instance.current.setDefaultModel(name, model);
      needUpdateInfo.current.forEach((_, name) => needUpdateInfo.current.set(name, true));
    },
    setModel: (model: TData) => {
      instance.current.setModel(model);
      needUpdateInfo.current.forEach((_, name) => needUpdateInfo.current.set(name, true));
    },
    overrideValue: (propName: string) => {
      instance.current.overrideValue(propName);
      needUpdateInfo.current.forEach((_, name) => needUpdateInfo.current.set(name, true));
    },
    getMergedModel: instance.current.getMergedModel,
    getModel: instance.current.getModel,
    getDefaultModel: instance.current.getDefaultModel,

    getValueInfo: (propName: string): IDefaultModelValueInfo => {
      if (needUpdateInfo.current.get(propName) !== false) {
        const info = instance.current.getValueInfo(propName);
        valueInfo.current.set(propName, info);
        needUpdateInfo.current.set(propName, false);
        return info;
      }
      return valueInfo.current.get(propName) ?? { state: 'onlyModel', latestDefaultModelName: '' };
    },
    setCurrentValueAdditionalInfo: (propName: string, additionalInfo: () => string | ReactElement) => {
      instance.current.setCurrentValueAdditionalInfo(propName, additionalInfo);
      forceRefresh({});
    },
    getCurrentValueAdditionalInfo: instance.current.getCurrentValueAdditionalInfo,
  };

  return (
    <DefaultModelProviderStateContext.Provider value={state}>
      {props.children}
    </DefaultModelProviderStateContext.Provider>
  );
};

export default DefaultModelProvider;
