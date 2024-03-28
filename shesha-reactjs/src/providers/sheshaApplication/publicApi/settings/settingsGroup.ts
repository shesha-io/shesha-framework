import { SettingsManager } from "./manager";

export interface ISettingsGroup {

}

/**
 * Settings group (module or category)
 */
export class SettingsGroup<TChild = ISettingsGroup> implements ISettingsGroup {
    readonly _accessor: string;
    readonly _children: Map<string, TChild>;
    readonly _settingManager: SettingsManager;

    createChild(accessor: string): TChild {
        throw new Error("Method 'createChild()' must be implemented. Accessor: " + accessor);
    }

    getSettingAccessor(accessor: string): ISettingsGroup {
        if (this._children.has(accessor))
            return this._children.get(accessor);

        const children = this.createChild(accessor);
        this._children.set(accessor, children);
        return children;
    }

    constructor(settingManager: SettingsManager, name: string) {
        this._settingManager = settingManager;
        this._accessor = name;
        this._children = new Map<string, TChild>();

        return new Proxy(this, {
            get(target, name) {
                if (name in target) {
                    const result = target[name];
                    return typeof result === 'function' ? result.bind(target) : result;
                }

                return typeof (name) === 'string'
                    ? target.getSettingAccessor(name)
                    : undefined;
            },
        });
    }
}