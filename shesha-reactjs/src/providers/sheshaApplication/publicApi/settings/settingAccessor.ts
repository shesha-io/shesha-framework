import { SettingsManager } from "./manager";

/**
 * Setting value accessor. It allows to read and write specified setting value.
 */
export interface ISettingAccessor<Value = any> {
    getValueAsync: () => Promise<Value>;
    setValue: (value: Value) => Promise<void>;
}
/**
 * Setting value accessor. It allows to read and write specified setting value.
 */
export class SettingAccessor<Value = any> implements ISettingAccessor<Value> {
    readonly _name: string;
    readonly _moduleName: string;
    readonly _settingManager: SettingsManager;

    constructor(settingManager: SettingsManager, moduleName: string, name: string) {
        this._settingManager = settingManager;
        this._moduleName = moduleName;
        this._name = name;
    }

    /**
     * Reads setting value
     *
     * @returns setting value
     */
    getValueAsync() {
        return this._settingManager.getValueAsync<Value>({ module: this._moduleName, name: this._name });
    };

    /**
     * Writes setting value
     * @param value New value
     * @returns Promise that will be resolved when value is written
     */
    setValue(value: Value): Promise<void> {
        return this._settingManager.setValueAsync<Value>({ module: this._moduleName, name: this._name }, value);
    }
}