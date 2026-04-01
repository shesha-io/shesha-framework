import { deepCopyViaJson, deepMergeValues, getValueByPropertyName, setValueByPropertyName } from "@/utils/object";
import { ReactElement } from "react";

export type DefaultModelValueState = 'usedDefault' | 'usedModel' | 'onlyModel';

export interface IDefaultModelValueInfo {
  state: DefaultModelValueState;
  latestDefaultModelName: string;
}

export interface IDefaultModelInstance<T> {
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

export class DefaultModelInstance<T extends object = object> implements IDefaultModelInstance<T> {
  private model: T = {} as T;

  private defaultModels: Map<string, T>;

  private defaultModel: T = {} as T;

  private mergedModel: T = {} as T;

  private valuesAdditionalInfo: Map<string, () => string | ReactElement> = new Map<string, () => string | ReactElement>();

  constructor() {
    this.defaultModels = new Map<string, T>();
  };

  #mergeModels = (model: T, defaultModel: T): T => {
    return deepMergeValues(deepCopyViaJson(model), defaultModel, (t, s, key) => {
      // skip merge
      // metadata value is empty
      return s[key] === undefined ||
        // model value is not empty (null is also a value) and if model value is object, it has at least one property
        (t[key] !== undefined && typeof t[key] !== 'object');
    });
  };

  #updateMergedModel = (): void => {
    this.mergedModel = this.#mergeModels(this.model, this.defaultModel);
  };

  #updateDefaultModel = (): void => {
    let model = {} as T;
    this.defaultModels.forEach((m) => {
      model = this.#mergeModels(model, m);
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
};
