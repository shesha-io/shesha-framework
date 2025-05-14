import { unproxyValue } from "@/utils/object";
import { ProxyPropertiesAccessors, ProxyWithRefresh, ValueAccessor } from "./observableProxy";
import { CreateTouchableProperty, IPropertyTouched } from "./touchableProperty";

export class TouchableProxy<T> implements ProxyWithRefresh<T>, IPropertyTouched {
    private _touchedProps: Map<string, any>;
    private _propAccessors: Map<string, ValueAccessor<any>>;
    private _changed: boolean;

    touched (_propName: string, fullPropName: string, value: any) {
      this._touchedProps.set(fullPropName, value);
    };

    getData() {
        return {};
    };

    getPropertyValue(propName: string): any {
        if (!this._propAccessors.has(propName))
            return undefined;

        const getter = this._propAccessors.get(propName);
        const propValue = getter();

        if (propValue === undefined)
            return undefined;
        if (propValue === null)
            return null;
    
        if (typeof propValue === 'function')
            return propValue.bind(this);

        if (typeof propValue === 'object')
            return CreateTouchableProperty(propValue, this, propName);

        this._touchedProps.set(propName, propValue);

        return propValue;
    };

    get touchedProps(): Map<string, any> {
        return this._touchedProps;
    };

    get changed(): boolean {
        return this._changed;
    };

    addAccessor(propName: string, accessor: ValueAccessor<any>) {
        this._propAccessors.set(propName, accessor);
    };

    checkChanged() {
        let changed = false;

        this._touchedProps.forEach((value, key) => {
            if (changed) 
                return;
            const props = key.split('.');
            let prop = props.shift();
            let data = unproxyValue(this.getPropertyValue(prop));
            if (data === null || data === undefined) {
                changed = true;
                return;
            }
            while (props.length > 0) {
                if (data === null || data === undefined) {
                    changed = true;
                    return;
                }
                prop = props.shift();
                if (data[prop] === undefined && props.length > 0) {
                    changed = true;
                    return;
                }
                data = data[prop];
            }

            if (typeof data === 'object' && (value === null || typeof value !== 'object'))
                changed = true;

            if (data !== value)
                changed = true;
        });

        this._changed = changed;
        return changed;
    };

    refreshAccessors = (accessors: ProxyPropertiesAccessors<T>) => {
        this._propAccessors.clear();
        Object.entries(accessors).forEach(([key, value]) => {
            if (typeof (value) === 'function') {
                this._propAccessors.set(key, value as ValueAccessor);
            }
        });
    };

    setAdditionalData = (data: any) => {
      for (let key in data) 
        if (Object.hasOwn(data, key)) 
          this.addAccessor(key, () => data[key]);
    };

    constructor(accessors: ProxyPropertiesAccessors<T>) {
        this._propAccessors = new Map<string, ValueAccessor>();
        this._touchedProps = new Map<string, any>();
        this.refreshAccessors(accessors);
        this._changed = true;

        return new Proxy(this, {
            get(target, name) {
                const propertyName = name.toString();

                if (propertyName === 'hasOwnProperty')
                    return (prop: string | Symbol) => {
                        return prop
                            ? target._propAccessors.has(prop.toString())
                            : false;
                    };

                if (target._propAccessors.has(propertyName))
                    return target.getPropertyValue(propertyName);

                if (propertyName in target) {
                    const result = target[name];
                    return typeof result === 'function' ? result.bind(target) : result;
                }

                return undefined;
            },
            has(target, prop) {
              return target._propAccessors.has(prop.toString());
            },
            ownKeys(target) {
                return Array.from(target._propAccessors.keys());
            },
            getOwnPropertyDescriptor(target, prop) {
                return target._propAccessors.has(prop.toString())
                    ? { enumerable: true, configurable: true, writable: false }
                    : undefined;
            }
        });
    }
;
}

export const makeTouchableProxy = <T = object>(accessors: ProxyPropertiesAccessors<T>): TouchableProxy<T> => {
    const result = new TouchableProxy(accessors);
    return result;
};