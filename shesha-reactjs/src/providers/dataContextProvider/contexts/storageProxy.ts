import { getValueByPropertyName, setValueByPropertyName } from "@/utils/object";

export interface IStorageProxy {
  setFieldValue: (name: string, value: any) => void;
  getFieldValue: (name: string) => any;
  getData: () => any;
  setData: (data: any) => void;
  getKeys: () => string[];
  updateOnChange: (onChange: () => void) => void;
}

export const CreateStorageProperty = (onChange: () => void, data?: object) => {
    const property = (Array.isArray(data))
        ? new StorageArrayProperty(onChange, data)
        : new StorageProperty(onChange, data);

    return new Proxy(property, {
        get(target, name) {
            const propertyName = name.toString();

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
            target.accessor.setFieldValue(propertyName, newValue);
            return true;
        },
        has(target, prop) {
            return prop.toString() in target.accessor;
        },
        ownKeys(target) {
            return target.accessor.getKeys();
        },
        getOwnPropertyDescriptor(target, prop) {
            if (target.accessor.getKeys().indexOf(prop.toString()) >= 0)
                return { enumerable: true, configurable: true, writable: true };
            return undefined;
        }
    });
};

export class StorageProperty implements IStorageProxy {
    readonly accessor: StorageProxyAccessor;

    updateOnChange = (onChange: () => void) => this.accessor.updateOnChange(onChange);
    setFieldValue = (name: string, value: any) => this.accessor.setFieldValue(name, value);
    getFieldValue = (name: string) => this.accessor.getFieldValue(name);
    getData = () => this.accessor.getData();
    setData = (data: any) => this.accessor.setData(data);
    getKeys = () => this.accessor.getKeys();

    constructor(onChange: () => void, initialData?: object) {
        this.accessor = new StorageProxyAccessor(onChange, initialData);
    }
}

export class StorageArrayProperty extends Array implements IStorageProxy {
    readonly accessor: StorageProxyAccessor;

    updateOnChange = (onChange: () => void) => this.accessor.updateOnChange(onChange);
    setFieldValue = (name: string, value: any) => this.accessor.setFieldValue(name, value);
    getFieldValue = (name: string) => this.accessor.getFieldValue(name);
    getData = () => this.accessor.getData();
    setData = (data: any) => this.accessor.setData(data);
    getKeys = () => this.accessor.getKeys();

    constructor(onChange: () => void, initialData?: object) {
        super();
        this.accessor = new StorageProxyAccessor(onChange, initialData);

        /*if (Array.isArray(initialData)) {
          this[Symbol.iterator] = () => {
            const data = this.accessor.getData() as Array<any>;
            let index = 0;
            return {
                [Symbol.iterator]: data[Symbol.iterator],
                [Symbol.toStringTag]: data[Symbol.toStringTag],
                [Symbol.dispose]: data[Symbol.dispose],
                map: data.map,
                filter: data.filter,
                take: (data as any).take,
                drop: (data as any).drop,
                flatMap: data.flatMap,
                reduce: data.reduce,
                toArray: (data as any).toArray,
                forEach: data.forEach,
                some: data.some,
                every: data.every,
                find: data.find,
                next() {
                    const result = {
                        value: data[index],
                        done: index >= data.length
                    };
                    index++;
                    return result;
                }
            };
          };
        }*/
    }
}


export class StorageProxyAccessor implements IStorageProxy {
    private _data: any;
    private _onChange: () => void;

    updateOnChange (onChange: () => void) {
      this._onChange = onChange;
    };

    getFieldValue(propName: string): any {
        const propValue = getValueByPropertyName(this._data, propName);

        if (propValue === undefined)
            return undefined;
        if (propValue === null)
            return null;
    
        if (typeof propValue === 'function')
            return propValue.bind(this._data);

        if (typeof propValue === 'object' && propValue) {
            return CreateStorageProperty(this._onChange, propValue);
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

    constructor(onChange: () => void, initialData?: object) {
        this._onChange = onChange;
        this.setData(initialData ?? {}, false);
    };
}