import { HttpClientApi } from "../http/api";
import { SettingsManager } from "./manager";
import { IModuleSettings, ModuleSettings } from "./moduleSettings";

export interface ISettingsApi {

}

/**
 * Settings API. Provides settings to the application settings groupped by modules.
 */
export class SettingsApi implements ISettingsApi {
    readonly _modules: Map<string, IModuleSettings>;
    readonly _settingManager: SettingsManager;

    /**
     * Retrieves the settings for a module by name, creating a new module settings object if it doesn't already exist.
     *
     * @param {string} name - The name of the module
     * @return {IModuleSettings} The settings for the specified module
     */
    getModuleSettings(name: string): IModuleSettings {
        if (this._modules.has(name))
            return this._modules.get(name);

        const moduleApi = new ModuleSettings(this._settingManager, name);
        this._modules.set(name, moduleApi);
        return moduleApi;
    }

    constructor(httpClient: HttpClientApi) {
        this._settingManager = new SettingsManager(httpClient);
        this._modules = new Map<string, IModuleSettings>();

        return new Proxy(this, {
            get(target, name) {
                if (name in target) {
                    const result = target[name];
                    return typeof result === 'function' ? result.bind(target) : result;
                }

                return typeof (name) === 'string'
                    ? target.getModuleSettings(name)
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