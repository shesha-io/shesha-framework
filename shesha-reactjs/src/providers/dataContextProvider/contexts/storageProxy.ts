import { isDefined } from "@/utils/nullables";
import { Path } from "@/utils/dotnotation";
import { getValueByPropertyName, hasProperty, setValueByPropertyName } from "@/utils/object";

export interface IStorageProxy<TData = unknown> {
  setFieldValue: (name: string, value: unknown) => void;
  getFieldValue: (name: string) => unknown;
  getData: () => TData;
  setData: (data: TData) => void;
  getKeys: () => string[];
  updateOnChange: (onChange: () => void) => void;
}

export interface IHasAccessor<TData = unknown> {
  readonly accessor: IStorageProxy<TData>;
}

export type IStorageProxyWithAccessor<TData = unknown> = IStorageProxy<TData> & IHasAccessor<TData>;

export const CreateStorageProperty = <TData extends object = object>(onChange: () => void, data?: TData): IStorageProxy<TData> => {
  const property = (Array.isArray(data))
    ? new StorageArrayProperty(onChange, data) as IStorageProxyWithAccessor<TData>
    : new StorageProperty(onChange, data);

  const proxy: IStorageProxy<TData> = new Proxy<IStorageProxyWithAccessor<TData>>(property, {
    get(target, name) {
      const propertyName = name.toString();

      if (propertyName === 'hasOwnProperty')
        return (prop: string | symbol) => prop ? propertyName in target.accessor : false;

      if (hasProperty(target.accessor, propertyName))
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
    },
  });
  return proxy;
};

export class StorageProperty<TData extends object = object> implements IStorageProxyWithAccessor<TData> {
  readonly accessor: StorageProxyAccessor<TData>;

  updateOnChange = (onChange: () => void): void => this.accessor.updateOnChange(onChange);

  setFieldValue = (name: string, value: unknown): void => this.accessor.setFieldValue(name, value);

  getFieldValue = (name: string): unknown => this.accessor.getFieldValue(name);

  getData = (): TData => this.accessor.getData();

  setData = (data: TData): void => this.accessor.setData(data);

  getKeys = (): string[] => this.accessor.getKeys();

  constructor(onChange: () => void, initialData?: TData) {
    this.accessor = new StorageProxyAccessor<TData>(onChange, initialData);
  }
}

export class StorageArrayProperty<TData extends unknown[] = unknown[]> extends Array implements IStorageProxyWithAccessor<TData> {
  readonly accessor: IStorageProxy<TData>;

  updateOnChange = (onChange: () => void): void => this.accessor.updateOnChange(onChange);

  setFieldValue = (name: string, value: unknown): void => this.accessor.setFieldValue(name, value);

  getFieldValue = (name: string): unknown => this.accessor.getFieldValue(name);

  getData = (): TData => this.accessor.getData();

  setData = (data: TData): void => this.accessor.setData(data);

  getKeys = (): string[] => this.accessor.getKeys();

  constructor(onChange: () => void, initialData: TData) {
    super();
    this.accessor = new StorageProxyAccessor<TData>(onChange, initialData);
  }
}

export class StorageProxyAccessor<TData extends object = object> implements IStorageProxy<TData> {
  private _data: TData = {} as TData;

  private _onChange: () => void;

  updateOnChange(onChange: () => void): void {
    this._onChange = onChange;
  };

  getFieldValue(propName: string): unknown {
    const propValue = getValueByPropertyName(this._data, propName as Path<TData>);

    if (propValue === undefined)
      return undefined;
    if (propValue === null)
      return null;

    if (typeof propValue === 'function')
      return propValue.bind(this._data);

    if (typeof propValue === 'object' && isDefined(propValue)) {
      return CreateStorageProperty(this._onChange, propValue);
    }

    return propValue;
  };

  setFieldValue(name: string, value: unknown): void {
    setValueByPropertyName(this._data, name, value);
    if (isDefined(this._onChange))
      this._onChange();
  };

  getData(): TData {
    return this._data;
  };

  setData(data: TData, update: boolean = true): void {
    this._data = data;
    this._data['setFieldValue'] = this.setFieldValue.bind(this);
    if (update && isDefined(this._onChange))
      this._onChange();
  };

  getKeys(): string[] {
    const keys = [];
    for (const key in this._data)
      if (Object.hasOwn(this._data, key))
        keys.push(key);
    return keys;
  };

  constructor(onChange: () => void, initialData?: TData) {
    this._onChange = onChange;
    this.setData(initialData ?? {} as TData, false);
  };
}
