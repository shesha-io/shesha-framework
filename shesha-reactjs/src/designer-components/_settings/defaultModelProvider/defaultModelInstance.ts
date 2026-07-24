import { Path } from "@/utils/dotnotation";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { deepCopyViaJson, deepMergeSkipUndefinedFunc, deepMergeValues, getStringPropertyOrUndefined, getValueByPropertyName, setValueByPropertyName } from "@/utils/object";
import { isEqual } from "lodash";
import { ReactElement } from "react";

export type DefaultModelValueState = 'usedDefault' | 'usedModel' | 'onlyModel';

export interface IDefaultModelValueInfo {
  state: DefaultModelValueState;
  latestDefaultModelName: string;
}

export interface IDefaultModelInstance<T extends object = object> {
  subscribePropertyUpdate(propertyName: string, callback: (dfi: IDefaultModelInstance<T>) => void): () => void;
  subscribe(type: DefaultModelSubscriptionType, callback: (dfi: IDefaultModelInstance<T>) => void, data?: Record<string, unknown>): () => void;
  notifySubscribers(type: DefaultModelSubscriptionType): void;

  setModel: (model: T | undefined) => void;
  setDefaultModel: (name: string, model: T) => void;
  removeDefaultModel: (name: string) => void;
  getMergedModel: () => T | undefined;
  getModel: () => T;
  getDefaultModel: (name?: string) => T | undefined;
  getValueInfo: (propName: string) => IDefaultModelValueInfo | undefined;
  overrideValue: (propName: string) => void;
  setCurrentValueAdditionalInfo: (propName: string, additionalInfo: string | ReactElement | undefined) => void;
  getCurrentValueAdditionalInfo: (propName: string) => string | ReactElement | undefined;
}

export type DefaultModelSubscription<Values extends object = object> = {
  callback: (dfi: IDefaultModelInstance<Values>) => void;
  data?: Record<string, unknown> | undefined;
};
export type DefaultModelSubscriptionType = 'property-modified';

interface IPropertyUpdateSubscriptionData {
  propertyName: string;
  value: unknown;
  valueInfo: IDefaultModelValueInfo;
  [key: string]: unknown;
}

const getDataForPropertyUpdateSubscription = <T extends object = object>(dfi: IDefaultModelInstance<T>, propertyName: string): IPropertyUpdateSubscriptionData | undefined => {
  const valueInfo = dfi.getValueInfo(propertyName);
  if (!isDefined(valueInfo)) return undefined;
  const value = getValueByPropertyName(dfi.getMergedModel(), propertyName as Path<object>);
  const additionalInfo = dfi.getCurrentValueAdditionalInfo(propertyName);
  return deepCopyViaJson({ propertyName, value, valueInfo, additionalInfo });
};

const defaultModelSubscriptionFuncs = new Map<DefaultModelSubscriptionType, (subscr: DefaultModelSubscription, dfi: IDefaultModelInstance) => Record<string, unknown> | undefined>([
  ['property-modified', (subscr, dfi) => {
    const propertyName = subscr.data
      ? getStringPropertyOrUndefined(subscr.data, 'propertyName') ?? ""
      : "";
    const data = getDataForPropertyUpdateSubscription(dfi, propertyName);
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

  private valuesAdditionalInfo: Map<string, string | ReactElement | undefined> = new Map<string, string | ReactElement | undefined>();

  private subscriptions: Map<DefaultModelSubscriptionType, Set<DefaultModelSubscription<T>>>;

  private valueInfo: Map<string, IDefaultModelValueInfo>;

  private needUpdateInfo: Map<string, boolean>;

  private forceUpdate: () => void;

  constructor(forceUpdate: () => void) {
    this.defaultModels = new Map<string, T>();
    this.subscriptions = new Map<DefaultModelSubscriptionType, Set<DefaultModelSubscription<T>>>();
    this.valueInfo = new Map<string, IDefaultModelValueInfo>();
    this.needUpdateInfo = new Map<string, boolean>();
    this.forceUpdate = forceUpdate;
  }

  #forceUpdate(): void {
    this.notifySubscribers('property-modified');
    this.forceUpdate();
  }

  #needUpdateAllInfo(): void {
    this.needUpdateInfo.forEach((_, name) => this.needUpdateInfo.set(name, true));
  }

  subscribePropertyUpdate(propertyName: string, callback: (dfi: IDefaultModelInstance<T>) => void): () => void {
    const data = getDataForPropertyUpdateSubscription(this, propertyName);
    return this.subscribe('property-modified', callback, data);
  }

  subscribe(type: DefaultModelSubscriptionType, callback: (dfi: IDefaultModelInstance<T>) => void, data?: Record<string, unknown>): () => void {
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
    // TODO: Alex, please check types and review defaultModelSubscriptionFuncs
    if (func && subscriptions)
      subscriptions.forEach((subscription) => subscription.data = func(subscription as unknown as DefaultModelSubscription, this as unknown as IDefaultModelInstance));
  }

  #updateMergedModel = (): void => {
    this.mergedModel = deepMergeValues(this.defaultModel, this.model, deepMergeSkipUndefinedFunc);
    this.notifySubscribers('property-modified');
  };

  #updateDefaultModel = (): void => {
    let model = {} as T;
    this.defaultModels.forEach((m) => {
      model = deepMergeValues(model, m, deepMergeSkipUndefinedFunc);
    });

    this.defaultModel = model;
  };

  setModel = (model: T | undefined): void => {
    if (model === undefined) return;
    this.model = deepCopyViaJson(model as T);
    this.#needUpdateAllInfo();
    this.#updateMergedModel();
    // Don't need to force update because this method is only store value
    // this.forceUpdate();
  };

  setDefaultModel = (name: string, model: T): void => {
    this.defaultModels.set(name, deepCopyViaJson(model as T));
    this.#needUpdateAllInfo();
    this.#updateDefaultModel();
    this.#updateMergedModel();
    this.#forceUpdate();
  };

  removeDefaultModel = (name: string): void => {
    this.defaultModels.delete(name);
    this.#needUpdateAllInfo();
    this.#updateDefaultModel();
    this.#updateMergedModel();
    this.#forceUpdate();
  };

  getMergedModel = (): T => {
    return this.mergedModel as T;
  };

  getModel = (): T => {
    return this.model as T;
  };

  getDefaultModel = (name?: string): T | undefined => {
    return isNullOrWhiteSpace(name) ? this.defaultModel : this.defaultModels.get(name);
  };

  getValueInfo = (propName: string): IDefaultModelValueInfo => {
    if (this.needUpdateInfo.get(propName) !== false) {
      const modelValue = getValueByPropertyName(this.model as Record<string, unknown>, propName);
      let defaultModelName = '';
      let defaultModelValue: unknown = undefined;

      this.defaultModels.forEach((model, name) => {
        const v = getValueByPropertyName(model as Record<string, unknown>, propName);
        if (v !== undefined) {
          defaultModelName = name;
          defaultModelValue = v;
        }
      });

      const info: IDefaultModelValueInfo = {
        state: defaultModelValue !== undefined
          ? modelValue === undefined
            ? 'usedDefault'
            : 'usedModel'
          : 'onlyModel',
        latestDefaultModelName: defaultModelName,
      };
      this.valueInfo.set(propName, info);
      this.needUpdateInfo.set(propName, false);
      return info;
    }
    return this.valueInfo.get(propName) ?? { state: 'onlyModel', latestDefaultModelName: '' };
  };

  overrideValue = (propName: string): void => {
    setValueByPropertyName(this.model, propName, getValueByPropertyName(this.defaultModel as Record<string, unknown>, propName));
    // ToDo: AS - check if need update all info insted of one property
    this.#needUpdateAllInfo();
    this.#updateMergedModel();
    this.#forceUpdate();
  };

  setCurrentValueAdditionalInfo = (propName: string, additionalInfo: string | ReactElement | undefined): void => {
    this.valuesAdditionalInfo.set(propName, additionalInfo);
    this.#forceUpdate();
  };

  getCurrentValueAdditionalInfo = (propName: string): string | ReactElement | undefined => {
    return this.valuesAdditionalInfo.get(propName);
  };
}
