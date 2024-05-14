export interface IBaseAccessor {

}

/**
 * Base group accessor
 */
export class BaseAccessor<TChild = IBaseAccessor, TManager = any> implements IBaseAccessor {
    readonly _accessor: string;
    readonly _children: Map<string, TChild>;
    readonly _manager: TManager;

    createChild(accessor: string): TChild {
        throw new Error("Method 'createChild()' must be implemented. Accessor: " + accessor);
    }

    getChildAccessor(accessor: string): IBaseAccessor {
        if (this._children.has(accessor))
            return this._children.get(accessor);

        const children = this.createChild(accessor);
        this._children.set(accessor, children);
        return children;
    }

    constructor(manager: TManager, name: string) {
        this._manager = manager;
        this._accessor = name;
        this._children = new Map<string, TChild>();

        return new Proxy(this, {
            get(target, name) {
                if (name in target) {
                    const result = target[name];
                    return typeof result === 'function' ? result.bind(target) : result;
                }

                return typeof (name) === 'string'
                    ? target.getChildAccessor(name)
                    : undefined;
            },
        });
    }
}