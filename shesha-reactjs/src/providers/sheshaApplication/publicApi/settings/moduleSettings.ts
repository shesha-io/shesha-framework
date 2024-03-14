import { SettingsManager } from "./manager";
import { ISettingAccessor, SettingAccessor } from "./settingAccessor";

export interface IModuleSettings {

}

/**
 * Module settings API
 */
export class ModuleSettings implements IModuleSettings {
    readonly _settings: Map<string, ISettingAccessor>;
    readonly _moduleName: string;
    readonly _settingManager: SettingsManager;

    getSettingAccessor(name: string): ISettingAccessor {
        if (this._settings.has(name))
            return this._settings.get(name);

        const settingAccessor = new SettingAccessor(this._settingManager, this._moduleName, name);
        this._settings.set(name, settingAccessor);
        return settingAccessor;
    }

    constructor(settingManager: SettingsManager, moduleName: string) {
        this._settingManager = settingManager;
        this._moduleName = moduleName;
        this._settings = new Map<string, ISettingAccessor>();

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

            set(target, name, value) {
                if (name in target) {
                    target[name] = value;
                    return true;
                }
                return false;
            }
        });
    }
}