import React, { createContext, PropsWithChildren, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { DefaultModelInstance, DefaultModelSubscriptionType, IDefaultModelInstance, IDefaultModelValueInfo } from './defaultModelInstance';

export interface IDefaultModelProviderProps<TData extends object = object> {
  name: string;
  defaultModel?: TData;
  model?: TData;
}

export interface IDefaultModelProviderState<TData extends object = object> {
  subscribePropertyUpdate(propertyName: string, callback: (dfi: DefaultModelInstance<TData>) => void): () => void;
  subscribe(type: DefaultModelSubscriptionType, callback: (dfi: DefaultModelInstance<TData>) => void, data?: Record<string, any>): () => void;
  notifySubscribers(type: DefaultModelSubscriptionType): void;

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

export const useDefaultModelPropertyUpdateSubscription = (propertyName: string): object => {
  const defaultModel = useDefaultModelProviderStateOrUndefined();
  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    if (!defaultModel) return undefined;
    // Subscribe to changes
    const unsubscribe = defaultModel.subscribePropertyUpdate(propertyName, () => forceUpdate({}));
    return unsubscribe; // Cleanup on unmount
  }, [defaultModel, propertyName]);

  return dummy;
};

export const useDefaultModelSubscription = (subscriptionType: DefaultModelSubscriptionType): object => {
  const defaultModel = useDefaultModelProviderStateOrUndefined();
  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    if (!defaultModel) return undefined;
    // Subscribe to changes
    const unsubscribe = defaultModel.subscribe(subscriptionType, () => forceUpdate({}));
    return unsubscribe; // Cleanup on unmount
  }, [defaultModel, subscriptionType]);

  return dummy;
};

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

  const state: IDefaultModelProviderState<TData> = {
    subscribePropertyUpdate: (propertyName: string, callback: (dfi: DefaultModelInstance<TData>) => void) => instance.subscribePropertyUpdate(propertyName, callback),
    subscribe: (type: DefaultModelSubscriptionType, callback: (dfi: DefaultModelInstance<TData>) => void, data?: Record<string, any>) => instance.subscribe(type, callback, data),
    notifySubscribers: (type: DefaultModelSubscriptionType) => instance.notifySubscribers(type),

    setDefaultModel: (name: string, model: TData) => {
      instance.setDefaultModel(name, model);
      needUpdateAllInfo();
      forceRefresh({});
    },
    // ToDo: AS - forceRefresh needs only for cases when inheritable values y
    setModel: (model: TData) => {
      instance.setModel(model);
      needUpdateAllInfo();
      // forceRefresh({});
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
  };

  return (
    <DefaultModelProviderStateContext.Provider value={state}>
      {props.children}
    </DefaultModelProviderStateContext.Provider>
  );
};

export default DefaultModelProvider;
