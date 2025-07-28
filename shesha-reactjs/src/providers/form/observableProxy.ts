export type ValueAccessor<TValue = any> = () => TValue;

export interface ProxyWithRefresh<T> {
    refreshAccessors: (accessors: ProxyPropertiesAccessors<T>) => void;
    addAccessor: (key: string, accessor: ValueAccessor<T>) => void;
    setAdditionalData: (data: any) => void;
};

export type ProxyPropertiesAccessors<Type> = {
    [Property in keyof Type]: ValueAccessor<Type[Property]>;
};

export type TypedProxy<T> = T & ProxyWithRefresh<T>;

export class ObservableProxy<T> implements ProxyWithRefresh<T> {
    private _touchedProps: Set<string>;
    private _propAccessors: Map<string, ValueAccessor<any>>;

    getPropertyValue(propName: string): any {
        if (!this._propAccessors.has(propName))
            return undefined;

        this._touchedProps.add(propName);
        const getter = this._propAccessors.get(propName);
        const propValue = getter();
        return propValue;
    }

    get touchedProps(): Set<string> {
        return this._touchedProps;
    };

    refreshAccessors = (accessors: ProxyPropertiesAccessors<T>) => {
        this._propAccessors.clear();
        Object.entries(accessors).forEach(([key, value]) => {
            if (typeof (value) === 'function') {
                this._propAccessors.set(key, value as ValueAccessor);
            }
        });
    };

    addAccessor = (key: string, accessor: ValueAccessor) => {
        if (typeof (accessor) === 'function') {
          this._propAccessors.set(key, accessor);
        }
    };

    setAdditionalData = (data: any) => {
      for (let key in data) 
        if (Object.hasOwn(data, key)) 
          this.addAccessor(key, () => data[key]);
    };

    constructor(accessors: ProxyPropertiesAccessors<T>) {
        this._propAccessors = new Map<string, ValueAccessor>();
        this._touchedProps = new Set<string>();
        this.refreshAccessors(accessors);

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
}

export const makeObservableProxy = <T = object>(accessors: ProxyPropertiesAccessors<T>): TypedProxy<T> => {
    const result = new ObservableProxy(accessors);
    return (result as any) as TypedProxy<T>;
};