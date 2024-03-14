import { ConfigurationItemVersionStatus } from "@/utils/configurationFramework/models";
import { HttpClientApi } from "../http/api";
import { SettingConfigurationDto } from "./models";
import qs from "qs";
import { GetAllResponse } from "@/interfaces/gql";
import { IAjaxResponse } from "@/interfaces";
import { verifiedCamelCase } from "@/utils/string";
import { ISettingIdentifier } from "@/providers/settings/models";

interface ModuleSettingsMap {
    name: string;
    settings: Map<string, string>;
}

export const SETTINGS_URLS = {
    GET_CONFIGURATIONS: '/api/dynamic/Shesha/SettingConfiguration/QueryAll',
    GET_VALUE: '/api/services/app/Settings/GetValue',
    SET_VALUE: '/api/services/app/Settings/UpdateValue',
};

export class SettingsManager {
    readonly _httpClient: HttpClientApi;
    static #configurationsPromise: Promise<SettingConfigurationDto[]> = undefined;
    #modulesMapPromise: Promise<Map<string, ModuleSettingsMap>> = undefined;

    resolveSettingAsync = (id: ISettingIdentifier): Promise<ISettingIdentifier> => {
        return this.#fetchModulesMapAsync().then(map => {
            const moduleItem = map.get(id.module);
            if (moduleItem) {
                const settingName = moduleItem.settings.get(id.name);
                if (settingName) {
                    return { module: moduleItem.name, name: settingName };
                }
            }
            return undefined;
        });
    };

    getValueAsync = <Value = any>(id: ISettingIdentifier): Promise<Value> => {
        return this.resolveSettingAsync(id).then(resolvedId => {
            const url = `${SETTINGS_URLS.GET_VALUE}?${qs.stringify(resolvedId)}`;
            return this._httpClient.get<IAjaxResponse<Value>>(url)
                .then(res => {
                    return res.data.success ? res.data.result : undefined;
                });
        });
    };

    setValueAsync = <Value = any>(id: ISettingIdentifier, value: Value): Promise<void> => {
        return this.resolveSettingAsync(id).then(resolvedId => {
            const payload = {
                module: resolvedId.module,
                name: resolvedId.name,
                value: value,
            };
            return this._httpClient.post<IAjaxResponse<void>>(SETTINGS_URLS.SET_VALUE, payload)
                .then(res => {
                    if (!res.data.success)
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

        const requestParams = {
            filter: JSON.stringify({
                and: [
                    { "==": [{ "var": "versionStatus" }, ConfigurationItemVersionStatus.Live] } // todo: add support of mode switcher
                ]
            }),
            properties: "name label description dataType module { name description }",
            skipCount: 0,
            maxResultCount: 1000,
        };
        const url = `${SETTINGS_URLS.GET_CONFIGURATIONS}?${qs.stringify(requestParams)}`;
        this.#configurationsPromise = httpClient.get<IAjaxResponse<GetAllResponse<SettingConfigurationDto>>>(url)
            .then(res => {
                const result = res.data.success ? res.data.result.items : [];
                return result;
            });
        return this.#configurationsPromise;
    };

    #fetchConfigurationsAsync = (): Promise<SettingConfigurationDto[]> => {
        return SettingsManager.fetchConfigurationsAsync(this._httpClient);
    };

    #fetchModulesMapAsync = () => {
        if (this.#modulesMapPromise)
            return this.#modulesMapPromise;

        this.#modulesMapPromise = this.#fetchConfigurationsAsync().then(configs => {
            const map = new Map<string, ModuleSettingsMap>();
            configs.forEach(config => {
                const camelCased = verifiedCamelCase(config.module.name);
                let moduleItem = map.get(camelCased);
                if (!moduleItem) {
                    moduleItem = { name: config.module.name, settings: new Map<string, string>() };
                    map.set(camelCased, moduleItem);
                }
                moduleItem.settings.set(verifiedCamelCase(config.name), config.name);
            });
            return map;
        });
        return this.#modulesMapPromise;
    };
}