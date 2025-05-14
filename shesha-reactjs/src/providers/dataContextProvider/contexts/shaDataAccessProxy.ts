import { GHOST_PAYLOAD_KEY } from "@/utils/form";
import { IFormApi } from "../../form/formApi";
import { getValueByPropertyName, setValueByPropertyName } from "@/utils/object";

export interface IShaDataAccessor {
  setFieldValue: (name: string, value: any) => void;
  getFieldValue: (name: string) => any;
  getData: () => any;
  setData: (data: any) => void;
}

export const CreateDataAccessor = (getData: () => any, setData: (data: any) => void, setFieldValue: (propertyName: string, value: any) => void, propertyName?: string) => {
  const data = getValueByPropertyName(getData(), propertyName);
  const property = (Array.isArray(data))
      ? new ShaArrayAccessProxy(getData, setData, setFieldValue, propertyName)
      : new ShaObjectAccessProxy(getData, setData, setFieldValue, propertyName);

  return new Proxy(property, {
      get(target, name) {
          const propertyName = name.toString();

          if (propertyName.includes(GHOST_PAYLOAD_KEY))
          return undefined;

          if (propertyName === 'hasOwnProperty')
              return (prop: string | Symbol) => prop ? propertyName in target.accessor : false;

          if (propertyName in target.accessor)
              return typeof target.accessor[propertyName] === 'function' 
                  ? target.accessor[propertyName].bind(target.accessor) 
                  : target.accessor[propertyName];

          return target.accessor.getFieldValue(propertyName);
      },
      set(target, name, newValue, _receiver) {
          const propertyName = name.toString();
          target.setFieldValue(propertyName, newValue);
          return true;
      },
      has(target, prop) {
        const propertyName = prop.toString();
        const data = target.getAccessorValue();
        return !propertyName.includes(GHOST_PAYLOAD_KEY) && data && propertyName in data;
      },
      ownKeys(target) {
        const data = target.getAccessorValue();
        return data ? Object.keys(data) : [];
      },
      getOwnPropertyDescriptor(target, prop) {
        const propertyName = prop.toString();
        const data = target.getAccessorValue();
        if (data && propertyName in data)
            return { enumerable: true, configurable: true, writable: true };
        return undefined;
      }
  });
};


export class ShaObjectAccessProxy implements IShaDataAccessor {
  readonly accessor: ShaDataAccessor;
  setFieldValue = (name: string, value: any) => this.accessor.setFieldValue(name, value);
  getFieldValue = (name: string) => this.accessor.getFieldValue(name);
  getData = () => this.accessor.getData();
  setData = (data: any) => this.accessor.setData(data);
  getAccessorValue = () => this.accessor.getAccessorValue();
  constructor(getData: () => any, setData: (data: any) => void, setFieldValue: (propertyName: string, value: any) => void, propertyName?: string) {
    this.accessor = new ShaDataAccessor(getData, setData, setFieldValue, propertyName);
  }
}

export class ShaArrayAccessProxy extends Array implements IShaDataAccessor {
  readonly accessor: ShaDataAccessor;
  setFieldValue = (name: string, value: any) => this.accessor.setFieldValue(name, value);
  getFieldValue = (name: string) => this.accessor.getFieldValue(name);
  getData = () => this.accessor.getData();
  setData = (data: any) => this.accessor.setData(data);
  getAccessorValue = () => this.accessor.getAccessorValue();
  constructor(getData: () => any, setData: (data: any) => void, setFieldValue: (propertyName: string, value: any) => void, propertyName?: string) {
    super();
    this.accessor = new ShaDataAccessor(getData, setData, setFieldValue, propertyName);
  }
}

export class ShaDataAccessor implements IShaDataAccessor {
  readonly getData: () => any;
  readonly setData: (data: any) => void;
  readonly _setFieldValue: (propertyName: string, value: any) => void;
  readonly propertyName: string;

  getFullPropertyName(propertyName: string): string {
    return this.propertyName ? `${this.propertyName}.${propertyName}` : propertyName;
  }

  getAccessorValue(): any {
    return getValueByPropertyName(this.getData(), this.propertyName);
  }

  getFieldValue(propertyName: string): any {
    const propName = this.getFullPropertyName(propertyName);
    const propValue = getValueByPropertyName(this.getData(), propName);

    if (propValue === undefined)
        return undefined;
    if (propValue === null)
        return null;

    if (typeof propValue === 'function')
        return propValue.bind(this.getData());

    if (typeof propValue === 'object' && propValue) {
        return CreateDataAccessor(this.getData, this.setData, this._setFieldValue, propName);// new ShaDataAccessor(this.getData, this.setData, this._setFieldValue, propName);
    }

    return propValue;
  }

  setFieldValue(propertyName: string, value: any) {
    this._setFieldValue(this.getFullPropertyName(propertyName), value );
  }

  constructor(getData: () => any, setData: (data: any) => void, setFieldValue: (propertyName: string, value: any) => void, propertyName?: string) {
    this.getData = getData;
    this.setData = setData;
    this._setFieldValue = setFieldValue;
    this.propertyName = propertyName;
  }
}

export function GetShaFormDataAccessor(shaInstance: IFormApi): IShaDataAccessor {
  return CreateDataAccessor(() => shaInstance.getFormData(), shaInstance.setFieldsValue, shaInstance.setFieldValue);
};


export function GetShaContextDataAccessor(onChange: () => void): IShaDataAccessor {
  let data = {};
  const setFieldValue = (propertyName: string, value: any) => { 
    setValueByPropertyName(data, propertyName, value);
    if (onChange) onChange();
  };
  const setData = (inputData: any) => {
    data = inputData;
    if (onChange) onChange();
  };
  return CreateDataAccessor(() => data, setData, setFieldValue);
};
