import { unproxyValue } from "@/utils/object";

export interface IPropertyTouch {
  propertyName: string;
  value: any;
}

export interface IPropertyTouched {
    touched: (propName: string, fullPropName: string, value: any) => void;
    getData: () => any;
}

export const CreateTouchableProperty = (data: any, parent: IPropertyTouched, name: string) => {
    const prop = (Array.isArray(data))
        ? new TouchableArrayProperty(data, parent, name)
        : new TouchableProperty(data, parent, name);

    return new Proxy(prop, {
        get(target, name) {
            if (name in target.accessor) {
                const result = target.accessor[name];
                return typeof result === 'function' ? result.bind(target) : result;
            }

            return typeof (name) === 'string'
                ? target.accessor.getChildAccessor(name)
                : undefined;
        },
        set(target, name, value) {
            target.accessor._data[name] = value;
            return true;
        },
        has(target, prop) {
          const propertyName = prop.toString();
          return propertyName in target.accessor._data;
        },
        ownKeys(target) {
          const data = target.accessor._data;
          return data ? Object.keys(data) : [];
        },
        getOwnPropertyDescriptor(target, prop) {
          const propertyName = prop.toString();
          const data = target.accessor._data;
          if (data && propertyName in data)
              return { enumerable: true, configurable: true, writable: true };
          return undefined;
        }
    });
};

export class TouchableProperty implements IPropertyTouched {
    readonly accessor: PropertyTouchAccessor;

    getData = () => this.accessor.getData();

    touched (propName: string, fullPropName: string, value: any) {
        this.accessor.touched(propName, fullPropName, value);
    }

    constructor(data: any, parent: IPropertyTouched, name: string) {
        this.accessor = new PropertyTouchAccessor(data, parent, name);
    }
}

export class TouchableArrayProperty extends Array implements IPropertyTouched {
    readonly accessor: PropertyTouchAccessor;

    getData = () => this.accessor.getData();

    touched (propName: string, fullPropName: string, value: any) {
        this.accessor.touched(propName, fullPropName, value);
    }

    constructor(data: any, parent: IPropertyTouched, name: string) {
        super();
        this.accessor = new PropertyTouchAccessor(data, parent, name);
    }
}

class PropertyTouchAccessor implements IPropertyTouched {
    readonly _accessor: string;
    readonly _children: Map<string, IPropertyTouched>;
    readonly _data: any;

    protected _touchedProps: Array<IPropertyTouch>;
    readonly _parent: IPropertyTouched;

    constructor(data: any, parent: IPropertyTouched, name: string) {
        this._accessor = name;
        this._children = new Map<string, IPropertyTouched>();
        this._data = data;
        this._parent = parent;

        this._touchedProps = new Array<IPropertyTouch>();

        if (Array.isArray(data)) {
          this[Symbol.iterator] = () => {
            const data = this._data;
            let index = 0;
            return {
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
        }
    };

    get touchedProps(): Array<IPropertyTouch> {
        return this._touchedProps;
    };

    getData = () => this._data;

    getChildAccessor(accessor: string): IPropertyTouched {
      if (this._children.has(accessor))
          return this._children.get(accessor);

      const children = this.createChild(accessor);
      this._children.set(accessor, children);
      return children;
    };

    addTouchedProp = (propName: string, value?: any) => {
        if (!this._touchedProps.find(p => p.propertyName === propName))
            this._touchedProps.push({propertyName: propName, value });
    };

    touched = (propName: string, fullPropName: string, value: any) => {
        this.addTouchedProp(propName);
        if (this._parent && this._parent.touched) 
            this._parent.touched(this._accessor, this._accessor + '.' + fullPropName, value);
    };

    createChild = (accessor: string) => {
        const child = this._data[accessor];
        const unproxiedValue = unproxyValue(child);


        if (typeof unproxiedValue === 'function')
            return unproxiedValue;

        this.touched(accessor, accessor, unproxiedValue);

        if (unproxiedValue !== null && typeof unproxiedValue === 'object')
            return CreateTouchableProperty(child, this, accessor);
          
        return child;
    };
}