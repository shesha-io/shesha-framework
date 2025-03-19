import { getValueByPropertyName, setValueByPropertyName } from "@/utils/object";

export interface IStorageProxy {
  setFieldValue: (name: string, value: any) => void;
  getFieldValue: (name: string) => any;
  getData: () => any;
  setData: (data: any) => void;
  getKeys: () => string[];
}

export class StorageProxy implements IStorageProxy {
    private _data: object;
    private _onChange: () => void;

      getFieldValue(propName: string): any {
        const propValue = getValueByPropertyName(this._data, propName);

        if (propValue === undefined)
            return undefined;
        if (propValue === null)
            return null;
    
        if (typeof propValue === 'function')
            return propValue.bind(this);

        if (typeof propValue === 'object' && propValue) {
            return new StorageProxy(this._onChange, propValue);
        }
    
        return propValue;
    };

    setFieldValue(name: string, value: any) {
      setValueByPropertyName(this._data, name, value);
      if (this._onChange)
        this._onChange();
    };
  
    getData() {
      return this._data;
    };

    setData(data: object, update: boolean = true) {
      this._data = data;
      this._data['setFieldValue'] = this.setFieldValue.bind(this);
      if (update && this._onChange)
        this._onChange();
    };

    getKeys(): string[] {
      const keys = [];
      for (const key in this._data)
        if (Object.hasOwn(this._data, key))
          keys.push(key);
      return keys;
    };

    constructor(onCahnge: () => void, initialData?: object) {
        this._onChange = onCahnge;
        this.setData(initialData ?? {}, false);

        return new Proxy(this, {
            get(target, name) {
                const propertyName = name.toString();

                if (propertyName === 'hasOwnProperty')
                    return (prop: string | Symbol) => prop ? propertyName in target : false;

                if (propertyName in target)
                    return typeof target[propertyName] === 'function' ? target[propertyName].bind(target) : target[propertyName];

                return target.getFieldValue(propertyName);

                return undefined;
            },
            set(target, name, newValue, _receiver) {
                const propertyName = name.toString();
                target.setFieldValue(propertyName, newValue);
                return true;
            },
            has(target, prop) {
                return prop.toString() in target;
            },
            ownKeys(target) {
                return target.getKeys();
            },
            getOwnPropertyDescriptor(_target, _prop) {
                return { enumerable: true, configurable: true, writable: true };
            }
        });
    };
}