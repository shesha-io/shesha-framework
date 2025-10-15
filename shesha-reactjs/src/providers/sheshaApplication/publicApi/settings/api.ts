import { HttpClientApi } from "@/publicJsApis/httpClient";
import { SettingsManager } from "./manager";
import { SettingsModuleAccessor } from "./moduleAccessor";

/**
 * Settings API. Provides settings to the application settings groupped by modules.
 */
export class SettingsApi {
  readonly _modules: Map<string, SettingsModuleAccessor>;

  readonly _settingManager: SettingsManager;

  /**
   * Retrieves the settings for a module by name, creating a new module settings object if it doesn't already exist.
   *
   * @param {string} name - The name of the module
   * @return {SettingsModuleAccessor} The settings for the specified module
   */
  getModuleSettings(name: string): SettingsModuleAccessor {
    if (this._modules.has(name))
      return this._modules.get(name);

    const moduleApi = new SettingsModuleAccessor(this._settingManager, name);
    this._modules.set(name, moduleApi);
    return moduleApi;
  }

  constructor(httpClient: HttpClientApi) {
    this._settingManager = new SettingsManager(httpClient);
    this._modules = new Map<string, SettingsModuleAccessor>();

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
      },
    });
  }
}
