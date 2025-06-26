import cleanDeep from "clean-deep";
import { mergeWith } from "lodash";
import moment from "moment";

export const unproxyValue = (value: any) => {
  return value && Boolean(value['getAccessorValue']) ? value.getAccessorValue() : value;
};

export const deepMergeValues = (target: any, source: any) => {
  return mergeWith({ ...target }, source, (objValue, srcValue, key, obj) => {
      // handle null
      if (srcValue === null) {
          // reset field to null
          obj[key] = null;
          return undefined;
      }

      // handle undefined
      if (srcValue === undefined) {
          // reset field to undefined
          obj[key] = undefined;
          return undefined;
      }

      // handle arrays
      if (Array.isArray(srcValue)) {
          // save array as is without merging
          return srcValue;
      }
    
      //handle moemnt objects
      if (moment.isMoment(srcValue)) {
          // save moment object without merging
          return srcValue;
      }

      // handle objects
      if (typeof objValue === "object" && typeof srcValue === "object") {
          // make a copy of merged objects
          return deepMergeValues(objValue, srcValue);
      }

      return undefined;
  });
};

export const getValueByPropertyName = (data: any, propertyName: string): any => {
    if (!propertyName)
        return data;
    if (Boolean(data)) {
        const path = propertyName.split(/\.|\[|\]/g).filter(Boolean);
        if (Array.isArray(path) && path.length > 0) {
            let value = data[path[0]];
            path.forEach((item, index) => {
                if (index > 0)
                    value = value && typeof value === 'object' ? value[item] : undefined;
            });
            return value;
        }
    }
    return data;
};

export const setValueByPropertyName = (data: any, propertyName: string, value: any, makeCopy: boolean = false) => {
    const propName = propertyName.split(/\.|\[|\]/g).filter(Boolean);
    const resultData = makeCopy ? { ...data } : data;

    if (Array.isArray(propName) && propName.length > 0) {
        let prop = resultData;
        propName.forEach((item, index) => {
            if (index < propName.length - 1 && item?.length > 0) {
                if (typeof prop[item] !== 'object') {
                    prop = prop[item] = Number.isNaN(Number(propName[index + 1])) ? {} : [];
                } else {
                    if (makeCopy)
                        prop = prop[item] = Array.isArray(prop[item]) ? [...prop[item]] : { ...prop[item] };
                    else
                        prop = prop[item];
                }
            }
        });
        if (propName[propName.length - 1]?.length > 0)
            prop[propName[propName.length - 1]] = value;
    }
    return resultData;
};

export const deepCopyViaJson = <TValue = any>(value: TValue): TValue => {
    if (!value)
        return value;

    return JSON.parse(JSON.stringify(value));
};

export const removeUndefinedProps = <T extends object>(value: T): Partial<T> => {
    return value
        ? cleanDeep(value, { undefinedValues: true })
        : value;
};