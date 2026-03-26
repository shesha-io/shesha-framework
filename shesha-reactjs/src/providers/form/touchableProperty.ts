import { IAnyObject } from "@/interfaces";
import { isDefined } from "@/utils/nullables";
import { unproxyValue } from "@/utils/object";

export interface IPropertyTouch {
  propertyName: string;
  value: unknown;
}

export type HasDataGetter<TData = unknown> = {
  getData: () => TData;
};

export const isHasDataGetter = (obj: unknown): obj is HasDataGetter => isDefined(obj) && typeof (obj) === "object" && "getData" in obj && typeof (obj.getData) === 'function';

export interface IPropertyTouched {
  touched: (propName: string, fullPropName: string, value: unknown) => void;
  getData: () => unknown;
  [Symbol.iterator]?: () => Iterator<unknown>;
}

export const CreateTouchableProperty = (data: object, parent: IPropertyTouched, name: string): IPropertyTouched => {
  const prop = (Array.isArray(data))
    ? new TouchableArrayProperty(data, parent, name)
    : new TouchableProperty(data, parent, name);

  return new Proxy(prop, {
    get(target, name) {
      if (name in target.accessor) {
        if (Object.hasOwn(target.accessor, name)) {
          const result = (target.accessor)[name as keyof typeof target.accessor];
          return typeof result === 'function' ? result.bind(target) : result;
        }
      }

      return typeof (name) === 'string'
        ? target.accessor.getChildAccessor(name)
        : undefined;
    },
    set(target, name, value) {
      (target.accessor._data as IAnyObject)[name] = value;
      return true;
    },
    has(target, prop) {
      const propertyName = prop.toString();
      return propertyName in target.accessor._data;
    },
    ownKeys(target) {
      const data = target.accessor._data;
      return isDefined(data) ? Reflect.ownKeys(data) : [];
    },
    getOwnPropertyDescriptor(target, prop) {
      const propertyName = prop.toString();
      const data = target.accessor._data;
      if (isDefined(data) && propertyName in data)
        return { enumerable: true, configurable: true, writable: true };
      return undefined;
    },
  });
};

export class TouchableProperty<T = unknown> implements IPropertyTouched {
  readonly accessor: PropertyTouchAccessor;

  getData = (): T => this.accessor.getData() as T;

  touched(propName: string, fullPropName: string, value: unknown): void {
    this.accessor.touched(propName, fullPropName, value);
  }

  constructor(data: object, parent: IPropertyTouched, name: string) {
    this.accessor = new PropertyTouchAccessor(data, parent, name);
  }
}

export class TouchableArrayProperty extends Array implements IPropertyTouched {
  readonly accessor: PropertyTouchAccessor;

  getData = (): unknown => this.accessor.getData();

  touched(propName: string, fullPropName: string, value: unknown): void {
    this.accessor.touched(propName, fullPropName, value);
  }

  constructor(data: object, parent: IPropertyTouched, name: string) {
    super();
    this.accessor = new PropertyTouchAccessor(data, parent, name);
  }
}

class PropertyTouchAccessor<T = object> implements IPropertyTouched {
  readonly _accessor: string;

  readonly _children: Map<string, IPropertyTouched | unknown>;

  readonly _data: T;

  protected _touchedProps: Array<IPropertyTouch>;

  readonly _parent: IPropertyTouched;

  constructor(data: T, parent: IPropertyTouched, name: string) {
    this._accessor = name;
    this._children = new Map<string, IPropertyTouched>();
    this._data = data;
    this._parent = parent;

    this._touchedProps = new Array<IPropertyTouch>();

    if (Array.isArray(data)) {
      (this as IPropertyTouched)[Symbol.iterator] = (): Iterator<unknown> => {
        const data = this._data;
        if (!Array.isArray(data))
          throw new Error('Data is not an array');
        let index = 0;
        return {
          next() {
            if (index < data.length) {
              return { value: data[index++], done: false };
            } else {
              return { value: undefined, done: true };
            }
          },
        } satisfies Iterator<unknown>;
      };
    }
  };

  get touchedProps(): Array<IPropertyTouch> {
    return this._touchedProps;
  };

  getData = (): unknown => this._data;

  getChildAccessor(accessor: string): IPropertyTouched | unknown {
    const existing = this._children.get(accessor);
    if (existing)
      return existing;

    const children = this.createChild(accessor);
    this._children.set(accessor, children);
    return children;
  };

  addTouchedProp = (propName: string, value?: unknown): void => {
    if (!this._touchedProps.find((p) => p.propertyName === propName))
      this._touchedProps.push({ propertyName: propName, value });
  };

  touched = (propName: string, fullPropName: string, value: unknown): void => {
    this.addTouchedProp(propName);
    if (isDefined(this._parent) && isDefined(this._parent.touched))
      this._parent.touched(this._accessor, this._accessor + '.' + fullPropName, value);
  };

  createChild = (accessor: string): IPropertyTouched | unknown => {
    const child = (this._data as IAnyObject)[accessor];
    const unproxiedValue = unproxyValue(child);

    if (typeof unproxiedValue === 'function')
      return unproxiedValue;

    this.touched(accessor, accessor, unproxiedValue);

    if (unproxiedValue !== null && typeof unproxiedValue === 'object')
      return CreateTouchableProperty(child as object, this, accessor);

    return child as IPropertyTouched;
  };
}
