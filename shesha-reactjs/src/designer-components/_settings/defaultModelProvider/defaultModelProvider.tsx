import React, { createContext, PropsWithChildren, ReactElement, useContext, useEffect, useState } from 'react';
import { DefaultModelInstance, DefaultModelSubscriptionType, IDefaultModelInstance } from './defaultModelInstance';

export interface IDefaultModelProviderProps<TData extends object = object> {
  name: string;
  defaultModel?: TData;
  model?: TData;
}

const DefaultModelProviderStateContext = createContext<IDefaultModelInstance<object> | undefined>(undefined);

export const useDefaultModelActionsOrUndefined = (): IDefaultModelInstance<object> | undefined => useContext(DefaultModelProviderStateContext);

export const useDefaultModelPropertyUpdateSubscription = (propertyName: string): object => {
  const defaultModel = useDefaultModelActionsOrUndefined();
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
  const defaultModel = useDefaultModelActionsOrUndefined();
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
  const [, forceUpdate] = useState({});
  const [instance] = useState<IDefaultModelInstance<TData>>(new DefaultModelInstance<TData>(() => forceUpdate({})));

  // Update models if props changed
  useEffect(() => {
    if (props.model !== undefined) instance.setModel(props.model);
  }, [instance, props.model]);
  useEffect(() => {
    if (props.defaultModel !== undefined) instance.setDefaultModel(props.name, props.defaultModel);
  }, [instance, props.defaultModel, props.name]);

  return (
    <DefaultModelProviderStateContext.Provider value={instance}>
      {props.children}
    </DefaultModelProviderStateContext.Provider>
  );
};

export default DefaultModelProvider;
