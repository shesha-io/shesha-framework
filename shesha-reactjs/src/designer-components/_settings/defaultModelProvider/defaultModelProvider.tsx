import React, { createContext, PropsWithChildren, ReactElement, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  getValueInfo: (propName: string) => IDefaultModelValueInfo;
  overrideValue: (propName: string) => void;
  setCurrentValueAdditionalInfo: (propName: string, additionalInfo: () => string | ReactElement) => void;
  getCurrentValueAdditionalInfo: (propName: string) => (() => string | ReactElement) | undefined;
}

const DefaultModelProviderStateContext = createContext<IDefaultModelProviderState<object> | undefined>(undefined);

export const useDefaultModelProviderStateOrUndefined = (): IDefaultModelProviderState<object> | undefined => useContext(DefaultModelProviderStateContext);

const DefaultModelProvider = <TData extends object = object>(props: PropsWithChildren<IDefaultModelProviderProps<TData>>): ReactElement => {
  const [, forceRefresh] = useState({});

  const valueInfo = useRef<Map<string, IDefaultModelValueInfo>>(new Map());
  const needUpdateInfo = useRef<Map<string, boolean>>(new Map());
  const [instance] = useState<IDefaultModelInstance<TData>>(new DefaultModelInstance<TData>());

  const needUpdateAllInfo = (): void => needUpdateInfo.current.forEach((_, name) => needUpdateInfo.current.set(name, true));

  useEffect(() => {
    if (props.model !== undefined) {
      instance.setModel(props.model);
      needUpdateAllInfo();
    }
    if (props.defaultModel !== undefined) {
      instance.setDefaultModel(props.name, props.defaultModel);
      needUpdateAllInfo();
    }
  }, [instance, props.defaultModel, props.model, props.name]);

  // ToDo: AS - check and optimize, probably need to memoize to prevent unnecessary rendering
  const state: IDefaultModelProviderState<TData> = useMemo(() => ({
    setDefaultModel: (name: string, model: TData) => {
      instance.setDefaultModel(name, model);
      needUpdateAllInfo();
      forceRefresh({});
    },
    setModel: (model: TData) => {
      instance.setModel(model);
      needUpdateAllInfo();
      forceRefresh({});
    },
    overrideValue: (propName: string) => {
      instance.overrideValue(propName);
      needUpdateAllInfo();
      forceRefresh({});
    },
    getMergedModel: instance.getMergedModel,
    getModel: instance.getModel,
    getDefaultModel: instance.getDefaultModel,

    getValueInfo: (propName: string): IDefaultModelValueInfo => {
      if (needUpdateInfo.current.get(propName) !== false) {
        const info = instance.getValueInfo(propName);
        valueInfo.current.set(propName, info);
        needUpdateInfo.current.set(propName, false);
        return info;
      }
      return valueInfo.current.get(propName) ?? { state: 'onlyModel', latestDefaultModelName: '' };
    },
    setCurrentValueAdditionalInfo: (propName: string, additionalInfo: () => string | ReactElement) => {
      instance.setCurrentValueAdditionalInfo(propName, additionalInfo);
      forceRefresh({});
    },
    getCurrentValueAdditionalInfo: instance.getCurrentValueAdditionalInfo,
  }), [instance]);

  return (
    <DefaultModelProviderStateContext.Provider value={state}>
      {props.children}
    </DefaultModelProviderStateContext.Provider>
  );
};

export default DefaultModelProvider;
