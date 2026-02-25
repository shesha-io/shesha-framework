import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import cleanDeep from "clean-deep";
import { mergeWith } from "lodash";
import moment from "moment";
import { Path, PathValue } from "./dotnotation";
import { TouchableArrayProperty, TouchableProperty } from "@/providers/form/touchableProperty";
import { TouchableProxy } from "@/providers/form/touchableProxy";
import { ShaArrayAccessProxy, ShaObjectAccessProxy } from "@/providers/dataContextProvider/contexts/shaDataAccessProxy";
import { WritableDraft } from "@reduxjs/toolkit";
import { StorageArrayProperty, StorageProperty } from "@/providers/dataContextProvider/contexts/storageProxy";
import { ObservableProxy } from "@/providers/form/observableProxy";

export const jsonSafeParse = <T = unknown>(value: string, defaultValue?: T): T | undefined => {
  try {
    return isNullOrWhiteSpace(value)
      ? defaultValue
      : typeof value === "string"
        ? JSON.parse(value)
        : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const isProxy = <TValue>(value: TValue): boolean => {
  return isDefined(value) && (
    value instanceof TouchableProperty ||
    value instanceof TouchableArrayProperty ||
    value instanceof TouchableProxy ||
    value instanceof ShaArrayAccessProxy ||
    value instanceof ShaObjectAccessProxy ||
    value instanceof StorageProperty ||
    value instanceof StorageArrayProperty ||
    value instanceof ObservableProxy
  );
};

export const unproxyValue = <TValue = unknown>(value: TValue): TValue => {
  const result = isDefined(value)
    ? value instanceof TouchableProperty ||
    value instanceof TouchableArrayProperty ||
    value instanceof TouchableProxy ||
    value instanceof StorageProperty ||
    value instanceof StorageArrayProperty
      ? value.getData() as TValue
      : value instanceof ShaArrayAccessProxy ||
        value instanceof ShaObjectAccessProxy
        ? value.getAccessorValue() as TValue
        : value instanceof ObservableProxy
          ? { ...value }
          : value
    : value;

  return isProxy(result) ? unproxyValue<TValue>(result) : result;
};

export const deepMergeValues = <TObject, TSource>(
  target: TObject,
  source: TSource,
  skipProp: ((target: TObject, source: TSource, key: string) => boolean) | undefined = undefined):
TObject & TSource => {
  return mergeWith({ ...target }, source, (objValue, srcValue, key, obj) => {
    // Check if the property should be skipped
    const skip = skipProp && typeof skipProp === 'function' ? skipProp(target, source, key) : false;
    // if skip is true, return original value
    if (skip) return objValue;

    // handle null
    if (srcValue === null) {
      // reset field to null
      if (typeof (obj) === 'object' && obj !== null)
        (obj as Record<string, unknown>)[key] = null;
      return undefined;
    }

    // handle undefined
    if (srcValue === undefined) {
      // reset field to undefined
      if (typeof (obj) === 'object' && obj !== null)
        (obj as Record<string, unknown>)[key] = undefined;
      return undefined;
    }

    // handle arrays
    if (Array.isArray(srcValue)) {
      // save array as is without merging
      return srcValue;
    }

    // handle moemnt objects
    if (moment.isMoment(srcValue)) {
      // save moment object without merging
      return srcValue;
    }

    // handle objects
    if (typeof objValue === "object" && typeof srcValue === "object") {
      // make a copy of merged objects
      return deepMergeValues(objValue, srcValue, skipProp);
    }

    return undefined;
  });
};

export const getValueByPropertyName = <TData, P extends Path<TData>>(data: TData, propertyName: P): PathValue<TData, P> | undefined => {
  if (!isDefined(data) || typeof propertyName !== 'string') {
    return undefined;
  }

  if (propertyName === '')
    return data as PathValue<TData, P>;

  if (typeof (data) !== 'object')
    return undefined;

  const properties = propertyName.split('.');
  let current: unknown = data;

  try {
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];

      // Check if current level is accessible
      if (!isDefined(current) || typeof current !== 'object' || isNullOrWhiteSpace(prop)) {
        return undefined;
      }

      // Check if property exists
      if (!(prop in current)) {
        return undefined;
      }

      current = (current as Record<string, unknown>)[prop];
    }
    return current as PathValue<TData, P>;
  } catch (error) {
    // Handle any unexpected errors during property access
    console.warn(`Error accessing property '${propertyName}':`, error);
    return undefined;
  }
};

export const unsafeGetValueByPropertyName = (data: object, propertyName: string): unknown | undefined => {
  return getValueByPropertyName(data, propertyName as Path<object>);
};

export const hasProperty = <T extends object = object>(obj: T, key: string | number | symbol): key is keyof T => {
  return key in obj;
};

export const safeGetProperty = <T extends object>(obj: T, key: string | symbol): T[keyof T] | undefined => {
  return hasProperty(obj, key)
    ? obj[key]
    : undefined;
};

export const setValueByPropertyName = <TData extends object = object>(data: TData, propertyName: string, value: unknown, makeCopy: boolean = false): TData => {
  const resultData = makeCopy ? { ...data } : data;
  const path = propertyName.split(/\.|\[|\]/g).filter(Boolean);
  const lastPropName = path.length > 0 ? path[path.length - 1] : undefined;
  if (isNullOrWhiteSpace(lastPropName))
    return resultData;

  let prop: object = resultData;
  for (let i = 0; i < path.length - 1; i++) {
    const propName = path[i] as keyof typeof prop;
    const level = prop[propName];
    if (typeof level !== 'object') {
      // create currnet level is missing depending on next index
      prop[propName] = (Number.isNaN(Number(path[i + 1])) ? {} : []) as never;
      prop = prop[propName];
    } else {
      if (makeCopy) {
        const newCopy = Array.isArray(level) ? [...level] : { ...(level as object) };
        prop[propName] = newCopy as never;
      }
      prop = level;
    }
  }
  prop[lastPropName as keyof typeof prop] = value as never;
  return resultData;
};

export const deepCopyViaJson = <TValue = unknown>(value: TValue): TValue => {
  if (!value)
    return value;

  return JSON.parse(JSON.stringify(value));
};

export const removeUndefinedProps = <T extends object>(value: T): Partial<T> => {
  return cleanDeep(value, { undefinedValues: true });
};

export const pickProps = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Pick<T, K>);
};

export const mapProps = <T extends object, K extends keyof T>(
  source: T,
  target: Partial<T>,
  properties: K[],
): void => {
  properties.forEach((prop) => {
    if (source[prop] !== undefined) {
      target[prop] = source[prop];
    }
  });
};


export const unwrapDraft = <T>(draft: WritableDraft<T>): T => {
  return draft as T;
};

export const getStringPropertyOrUndefined = (obj: object, key: string | null | undefined): string | undefined => {
  if (!isNullOrWhiteSpace(key) && key in obj) {
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
};

export const getFirstNonEmptyStringPropertyOrUndefined = (obj: object, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = getStringPropertyOrUndefined(obj, key);
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
};
