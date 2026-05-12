import { Path } from "@/utils/dotnotation";
import { deepCopyViaJson, deepMergeValues, getValueByPropertyName, setValueByPropertyName } from "@/utils/object";
import { isEqual } from "lodash";
import { ReactElement } from "react";

export type DefaultModelValueState = 'usedDefault' | 'usedModel' | 'onlyModel';

export interface IDefaultModelValueInfo {
  state: DefaultModelValueState;
  latestDefaultModelName: string;
}

export interface IDefaultModelInstance<T extends object = object> {
  subscribePropertyUpdate(propertyName: string, callback: (dfi: DefaultModelInstance<T>) => void): () => void;
  subscribe(type: DefaultModelSubscriptionType, callback: (dfi: DefaultModelInstance<T>) => void, data?: Record<string, any>): () => void;
  notifySubscribers(type: DefaultModelSubscriptionType): void;

  setModel: (model: T) => void;
  setDefaultModel: (name: string, model: T) => void;
  getMergedModel: () => T;
  getModel: () => T;
  getDefaultModel: (name?: string) => T | undefined;
  getValueInfo: (propName: string) => IDefaultModelValueInfo;
  overrideValue: (propName: string) => void;
  setCurrentValueAdditionalInfo: (propName: string, additionalInfo: () => string | ReactElement) => void;
  getCurrentValueAdditionalInfo: (propName: string) => (() => string | ReactElement) | undefined;
}

export type DefaultModelSubscription<Values extends object = object> = {
  callback: (dfi: DefaultModelInstance<Values>) => void;
  data?: Record<string, any>;
};
export type DefaultModelSubscriptionType = 'property-modified';

interface IPropertyUpdateSubscriptionData {
  propertyName: string;
  value: unknown;
  valueInfo: IDefaultModelValueInfo;
}

const getDataForPropertyUpdateSubscription: (dfi: DefaultModelInstance, propertyName: string) => IPropertyUpdateSubscriptionData = (dfi, propertyName) => {
  const value = getValueByPropertyName(dfi.getMergedModel(), propertyName as Path<object>);
  const valueInfo = dfi.getValueInfo(propertyName);
  return deepCopyViaJson({ propertyName, value, valueInfo });
};

const defaultModelSubscriptionFuncs = new Map<DefaultModelSubscriptionType, (subscr: DefaultModelSubscription, dfi: DefaultModelInstance) => Record<string, any>>([
  ['property-modified', (subscr, dfi) => {
    const data = getDataForPropertyUpdateSubscription(dfi, subscr.data?.propertyName);
    if (isEqual(subscr.data, data)) return subscr.data;
    subscr.callback(dfi);
    return data;
  }],
]);

export class DefaultModelInstance<T extends object = object> implements IDefaultModelInstance<T> {
  private model: T = {} as T;

  private defaultModels: Map<string, T>;

  private defaultModel: T = {} as T;

  private mergedModel: T = {} as T;

  private valuesAdditionalInfo: Map<string, () => string | ReactElement> = new Map<string, () => string | ReactElement>();

  private subscriptions: Map<DefaultModelSubscriptionType, Set<DefaultModelSubscription<T>>>;

  constructor() {
    this.defaultModels = new Map<string, T>();
    this.subscriptions = new Map<DefaultModelSubscriptionType, Set<DefaultModelSubscription<T>>>();
  }

  subscribePropertyUpdate(propertyName: string, callback: (dfi: DefaultModelInstance<T>) => void): () => void {
    return this.subscribe('property-modified', callback, getDataForPropertyUpdateSubscription(this, propertyName));
  }

  subscribe(type: DefaultModelSubscriptionType, callback: (dfi: DefaultModelInstance<T>) => void, data?: Record<string, any>): () => void {
    const current = this.subscriptions.get(type) ?? new Set<DefaultModelSubscription<T>>();
    current.add({ callback, data });
    this.subscriptions.set(type, current);
    return () => this.unsubscribe(type, callback);
  }

  private unsubscribe(type: DefaultModelSubscriptionType, callback: (dfi: DefaultModelInstance<T>) => void): void {
    const current = this.subscriptions.get(type);
    if (!current)
      return;
    const subscription = Array.from(current).find((e) => e.callback === callback);
    if (subscription) {
      current.delete(subscription);
    }
    this.subscriptions.set(type, current);
  }

  notifySubscribers(type: DefaultModelSubscriptionType): void {
    const func = defaultModelSubscriptionFuncs.get(type);
    const subscriptions = this.subscriptions.get(type);
    if (func && subscriptions)
      subscriptions.forEach((subscription) => subscription.data = func(subscription, this));
  }

  #updateMergedModel = (): void => {
    this.mergedModel = deepMergeValues(deepCopyViaJson(this.model), this.defaultModel, (t, s, key) => {
      // skip merge
      // default value is empty
      return s[key] === undefined ||
        // model value is not empty (null is also a value) and if model value is object, it has at least one property
        (t[key] !== undefined && typeof t[key] !== 'object');
    });

    this.notifySubscribers('property-modified');
  };

  #updateDefaultModel = (): void => {
    let model = {} as T;
    this.defaultModels.forEach((m) => {
      model = deepMergeValues(deepCopyViaJson(model), m, (_, s, key) => {
        // skip merge if default value is empty
        return s[key] === undefined;
      });
    });

    this.defaultModel = model;
  };

  setModel = (model: T): void => {
    if (model === undefined) return;
    this.model = deepCopyViaJson(model ?? {} as T);
    this.#updateMergedModel();
  };

  setDefaultModel = (name: string, model: T): void => {
    this.defaultModels.set(name, deepCopyViaJson(model ?? {} as T));
    this.#updateDefaultModel();
    this.#updateMergedModel();
  };

  getMergedModel = (): T => {
    return this.mergedModel as T;
  };

  getModel = (): T => {
    return this.model as T;
  };

  getDefaultModel = (name?: string): T | undefined => {
    return !name ? this.defaultModel : this.defaultModels.get(name);
  };

  getValueInfo = (propName: string): IDefaultModelValueInfo => {
    const modelValue = getValueByPropertyName(this.model as Record<string, unknown>, propName);
    let defaultModelName = '';
    let defaultModelValue = undefined;

    this.defaultModels.forEach((model, name) => {
      const v = getValueByPropertyName(model as Record<string, unknown>, propName);
      if (v !== undefined) {
        defaultModelName = name;
        defaultModelValue = v;
      }
    });

    return {
      state: defaultModelValue !== undefined
        ? modelValue === undefined
          ? 'usedDefault'
          : 'usedModel'
        : 'onlyModel',
      latestDefaultModelName: defaultModelName,
    };
  };

  overrideValue = (propName: string): void => {
    setValueByPropertyName(this.model, propName, getValueByPropertyName(this.defaultModel as Record<string, unknown>, propName));
    this.#updateMergedModel();
  };

  setCurrentValueAdditionalInfo = (propName: string, additionalInfo: () => string | ReactElement): void => {
    this.valuesAdditionalInfo.set(propName, additionalInfo);
  };

  getCurrentValueAdditionalInfo = (propName: string): (() => string | ReactElement) | undefined => {
    return this.valuesAdditionalInfo.get(propName);
  };
}
