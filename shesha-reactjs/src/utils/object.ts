import cleanDeep from "clean-deep";
import { mergeWith } from "lodash";
import moment from "moment";

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
      if (Array.isArray(objValue)) {
          return srcValue;
      }
    
      //handle moemnt objects
      if (moment.isMoment(srcValue)) {
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
    if (!!data) {
        const path = propertyName.split('.');
        if (Array.isArray(path) && path.length > 0) {
            let value = data[path[0]];
            path.forEach((item, index) => {
                if (index > 0)
                    value = typeof value === 'object' ? value[item] : undefined;
            });
            return value;
        }
    }
    return undefined;
};

export const setValueByPropertyName = (data: any, propertyName: string, value: any, makeCopy: boolean = false) => {
    const propName = propertyName.split('.');
    const resultData = makeCopy ? { ...data } : data;

    if (Array.isArray(propName) && propName.length > 0) {
        let prop = resultData;
        propName.forEach((item, index) => {
            if (index < propName.length - 1 && item?.length > 0) {
                if (typeof prop[item] !== 'object') {
                    prop = prop[item] = {};
                } else {
                    if (makeCopy)
                        prop = prop[item] = { ...prop[item] };
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