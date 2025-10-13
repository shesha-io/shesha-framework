import { HttpClientApi } from "@/publicJsApis/httpClient";
import { SettingConfigurationDto } from "./models";
import qs from "qs";
import { IAjaxResponse } from "@/interfaces";
import { ISettingFullAccessor, ISettingIdentifier } from "@/providers/settings/models";
import { isAjaxErrorResponse } from "@/interfaces/ajaxResponse";

interface CategorySettingsMap {
  name: string;
  settings: Map<string, string>;
}

interface ModuleSettingsMap {
  name: string;
  categories: Map<string, CategorySettingsMap>;
}

export const SETTINGS_URLS = {
  GET_CONFIGURATIONS: '/api/services/app/Settings/GetConfigurations',
  GET_VALUE: '/api/services/app/Settings/GetValue',
  SET_VALUE: '/api/services/app/Settings/UpdateValue',
};

export class SettingsManager {
  readonly _httpClient: HttpClientApi;

  static #configurationsPromise: Promise<SettingConfigurationDto[]> = undefined;

  #modulesMapPromise: Promise<Map<string, ModuleSettingsMap>> = undefined;

  resolveSettingAsync = (id: ISettingFullAccessor): Promise<ISettingIdentifier> => {
    return this.#fetchModulesMapAsync().then((map) => {
      const moduleItem = map.get(id.module);
      if (moduleItem) {
        const category = moduleItem.categories.get(id.category);
        if (category) {
          return {
            module: moduleItem.name,
            name: category.settings.get(id.name),
          };
        }
      }
      return undefined;
    });
  };

  getValueAsync = <Value = any>(id: ISettingFullAccessor): Promise<Value> => {
    return this.resolveSettingAsync(id).then((resolvedId) => {
      const url = `${SETTINGS_URLS.GET_VALUE}?${qs.stringify(resolvedId)}`;
      return this._httpClient.get<IAjaxResponse<Value>>(url)
        .then((res) => {
          return res.data.success ? res.data.result : undefined;
        });
    });
  };

  setValueAsync = <Value = any>(id: ISettingFullAccessor, value: Value): Promise<void> => {
    return this.resolveSettingAsync(id).then((resolvedId) => {
      const payload = {
        module: resolvedId.module,
        name: resolvedId.name,
        value: value,
      };
      return this._httpClient.post<IAjaxResponse<void>>(SETTINGS_URLS.SET_VALUE, payload)
        .then((res) => {
          if (isAjaxErrorResponse(res.data))
            throw new Error("Failed to update setting value: " + res.data.error.message);
        });
    });
  };

  constructor(httpClient: HttpClientApi) {
    this._httpClient = httpClient;
  }

  static fetchConfigurationsAsync = (httpClient: HttpClientApi): Promise<SettingConfigurationDto[]> => {
    if (this.#configurationsPromise)
      return this.#configurationsPromise;

    this.#configurationsPromise = httpClient.get<IAjaxResponse<SettingConfigurationDto[]>>(SETTINGS_URLS.GET_CONFIGURATIONS)
      .then((res) => {
        const result = res.data.success ? res.data.result : [];
        return result;
      });
    return this.#configurationsPromise;
  };

  #fetchConfigurationsAsync = (): Promise<SettingConfigurationDto[]> => {
    return SettingsManager.fetchConfigurationsAsync(this._httpClient);
  };

  #fetchModulesMapAsync = (): Promise<Map<string, ModuleSettingsMap>> => {
    if (this.#modulesMapPromise)
      return this.#modulesMapPromise;

    this.#modulesMapPromise = this.#fetchConfigurationsAsync().then((configs) => {
      const map = new Map<string, ModuleSettingsMap>();
      configs.forEach((config) => {
        let moduleItem = map.get(config.module.accessor);
        if (!moduleItem) {
          moduleItem = {
            name: config.module.name,
            categories: new Map<string, CategorySettingsMap>(),
          };
          map.set(config.module.accessor, moduleItem);
        }
        let categoryItem = moduleItem.categories.get(config.category.accessor);
        if (!categoryItem) {
          categoryItem = { name: config.category.name, settings: new Map<string, string>() };
          moduleItem.categories.set(config.category.accessor, categoryItem);
        }
        categoryItem.settings.set(config.accessor, config.name);
      });
      return map;
    });
    return this.#modulesMapPromise;
  };
}
