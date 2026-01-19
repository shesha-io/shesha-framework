import { FormIdFullNameDtoAjaxResponse } from "@/apis/entityConfig";
import { ConfigurableItemFullName, ConfigurableItemIdentifier, ConfigurableItemUid, FormFullName, IFormDto, isConfigurableItemFullName, isConfigurableItemRawId, IToolboxComponents } from "@/interfaces";
import { extractAjaxResponse, IAjaxResponse, isAjaxSuccessResponse } from "@/interfaces/ajaxResponse";
import { HttpClientApi, HttpResponse } from "@/publicJsApis/httpClient";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { PromisedValue, StatefulPromise } from "@/utils/promises";
import { buildUrl } from "@/utils/url";
import axios from "axios";
import { URLS } from ".";
import { IComponentSettings } from "../appConfigurator/models";
import { migrateFormSettings } from "../form/migration/formSettingsMigrations";
import { ConfigurationType, ICacheProvider, IGetFormPayload, IGetRefListPayload } from "../metadataDispatcher/entities/models";
import { getEntityTypeIdentifierQueryParams } from "../metadataDispatcher/entities/utils";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";
import { ConfigurationLoadingError } from "./errors";
import { ConfigurationDto, FormConfigurationDto, IClearFormCachePayload, IConfigurationItemDto, IGetComponentPayload, IUpdateComponentPayload, ReferenceListDto } from "./models";
import { convertFormConfigurationDto2FormDto, getConfigurationNotFoundMessage } from "./utils";

export interface GetConfigurationArgs {
  type: string;
  id: ConfigurableItemIdentifier;
  topLevelModule?: string;
  skipCache: boolean;
};

type FetchConfigurationArgs<TId> = {
  type: string;
  id: TId;
  topLevelModule?: string;
  md5: string | null;
};

type FetchConfigurationPayload = Omit<GetConfigurationArgs, 'skipCache'> & {
  cachedConfiguration: IConfigurationItemDto | undefined;
};

export interface IConfigurationLoader {
  getCachedConfigAsync<TConfigDto extends ConfigurationDto = ConfigurationDto>(args: GetConfigurationArgs): Promise<IConfigurationItemDto<TConfigDto> | undefined>;
  getCurrentConfigAsync<TConfigDto extends ConfigurationDto = ConfigurationDto>(args: GetConfigurationArgs): PromisedValue<TConfigDto>;
  clearCacheAsync: (type: string, id: ConfigurableItemIdentifier) => Promise<void>;

  getFormAsync: (payload: IGetFormPayload) => Promise<IFormDto>;
  getRefListAsync: (payload: IGetRefListPayload) => PromisedValue<ReferenceListDto>;
  getEntityFormIdAsync: (entityType: string | IEntityTypeIdentifier, formType: string) => Promise<FormFullName>;
  clearFormCache: (payload: IClearFormCachePayload) => void;
  getComponentAsync: (payload: IGetComponentPayload) => PromisedValue<IComponentSettings>;
  updateComponentAsync: (payload: IUpdateComponentPayload) => Promise<void>;
};

export interface ConfigurationLoaderConstructorArgs {
  httpClient: HttpClientApi;
  cacheProvider: ICacheProvider;
  designerComponents: IToolboxComponents;
};

export interface IConfigurationRequests {
  [key: string]: PromisedValue<ConfigurationDto> | undefined;
}

type GetCurrentConfigPayload = {
  itemType: string;
  name: string;
  module: string;
  md5: string | null;
};

type GetConfigPayload = {
  itemType: string;
  id: string;
  md5: string | null;
};


type ConfigurationLookup = {
  /* Module name for a configuration item that should be used when top level module is not specified */
  _default?: string;
  /* Lookup of top level module to module where configuration item is overridden. Is used when top level module is specified */
  [key: string]: string;
};
type ConfigurationRawIdLookup = {
  module: string;
  name: string;
};

type ModuleInfo = {
  name: string;
  description: string | null;
  alias: string | null;
  isEditable: boolean;
};
type GetModulesResponse = {
  modules: ModuleInfo[];
};

const LOOKUP_SUFFIX = '_lookup';

export class ConfigurationLoader implements IConfigurationLoader {
  #httpClient: HttpClientApi;

  #designerComponents: IToolboxComponents;

  #cacheProvider: ICacheProvider;

  #requests: Map<string, IConfigurationRequests> = new Map<string, IConfigurationRequests>();

  #modules: Map<string, ModuleInfo> | undefined;

  constructor(args: ConfigurationLoaderConstructorArgs) {
    this.#httpClient = args.httpClient;
    this.#cacheProvider = args.cacheProvider;
    this.#designerComponents = args.designerComponents;
  }

  getComponentAsync = (_payload: IGetComponentPayload): PromisedValue<IComponentSettings> => {
    throw new Error('Not implemented');
  };

  updateComponentAsync = (_payload: IUpdateComponentPayload): Promise<void> => {
    throw new Error('Not implemented');
  };

  clearFormCache = (payload: IClearFormCachePayload): void => {
    this.clearCacheAsync(ConfigurationType.Form, payload.formId);
  };

  getEntityFormIdAsync = async (entityType: string | IEntityTypeIdentifier, formType: string): Promise<FormFullName> => {
    const url = buildUrl(URLS.GET_ENTITY_CONFIG_FORM, { ...getEntityTypeIdentifierQueryParams(entityType), typeName: formType });

    const response = await this.#httpClient.get<FormIdFullNameDtoAjaxResponse>(url);
    const dto = extractAjaxResponse(response.data);
    return { name: dto.name, module: dto.module };
  };

  getModulesAsync = async (): Promise<Map<string, ModuleInfo>> => {
    if (!isDefined(this.#modules)) {
      const response = await this.#httpClient.get<IAjaxResponse<GetModulesResponse>>(URLS.GET_MODULES);
      const modulesResponse = extractAjaxResponse(response.data);
      this.#modules = new Map(modulesResponse.modules.map((m) => [m.name, m]));
    }
    return this.#modules;
  };

  isModuleEditableAsync = async (moduleName: string): Promise<boolean> => {
    const modules = await this.getModulesAsync();
    return modules.get(moduleName)?.isEditable ?? false;
  };

  getFormAsync = async (payload: IGetFormPayload): Promise<IFormDto> => {
    const form = await this.getCurrentConfigAsync<FormConfigurationDto>({ type: ConfigurationType.Form, id: payload.formId, skipCache: payload.skipCache });
    const isEditable = await this.isModuleEditableAsync(form.module);
    const dto = migrateFormSettings(convertFormConfigurationDto2FormDto(form, !isEditable), this.#designerComponents);
    return dto;
  };

  getRefListAsync = (payload: IGetRefListPayload): PromisedValue<ReferenceListDto> => {
    return this.getCurrentConfigAsync<ReferenceListDto>({ type: ConfigurationType.ReferenceList, id: payload.refListId, skipCache: payload.skipCache });
  };

  clearCacheAsync = (type: string, id: ConfigurableItemIdentifier): Promise<void> => {
    const requests = this.getExistingRequests(type);
    // TODO: review cache cleaning after conversion to generic loader and review of requests structure
    const key = this.getExistingConfigRequestKey(id, undefined);
    delete requests[key];
    return Promise.resolve();
  };

  getCacheKeyByFullName = (module: string | null, name: string): string => {
    return `${module}:${name}`;
  };

  getConfigLookupAsync = async (type: string, id: ConfigurableItemFullName): Promise<ConfigurationLookup | undefined> => {
    const cache = this.#cacheProvider.getCache(`${type}${LOOKUP_SUFFIX}`);
    if (isConfigurableItemFullName(id)) {
      const key = this.getCacheKeyByFullName(id.module, id.name);
      return await cache.getItem<ConfigurationLookup>(key) ?? undefined;
    }
    if (isConfigurableItemRawId(id)) {
      const key = id;
      const rawIdLookup = await cache.getItem<ConfigurationRawIdLookup>(key) ?? undefined;
      return rawIdLookup && rawIdLookup.module && rawIdLookup.name
        ? await this.getConfigLookupAsync(type, { module: rawIdLookup.module, name: rawIdLookup.name })
        : undefined;
    }
    return undefined;
  };

  getConfigRawIdLookupAsync = async (type: string, id: ConfigurableItemUid): Promise<ConfigurableItemFullName | undefined> => {
    const key = id;
    const cache = this.#cacheProvider.getCache(`${type}${LOOKUP_SUFFIX}`);
    const rawIdLookup = await cache.getItem<ConfigurationRawIdLookup>(key);
    return rawIdLookup && !isNullOrWhiteSpace(rawIdLookup.module) && !isNullOrWhiteSpace(rawIdLookup.name)
      ? { name: rawIdLookup.name, module: rawIdLookup.module }
      : undefined;
  };

  setConfigRawIdLookupAsync = async (type: string, rawId: ConfigurableItemUid, fullName: ConfigurableItemFullName): Promise<void> => {
    const key = rawId;
    const cache = this.#cacheProvider.getCache(`${type}${LOOKUP_SUFFIX}`);
    await cache.setItem(key, { module: fullName.module, name: fullName.name });
  };

  getLookupModule = (lookup: ConfigurationLookup, topLevelModule: string | undefined): string | undefined => {
    return isNullOrWhiteSpace(topLevelModule)
      ? lookup._default
      : lookup[topLevelModule];
  };

  setLookupModule = (lookup: ConfigurationLookup, topLevelModule: string | undefined, module: string): ConfigurationLookup => {
    return isNullOrWhiteSpace(topLevelModule)
      ? { ...lookup, _default: module }
      : { ...lookup, [topLevelModule]: module };
  };

  removeLookupModule = (lookup: ConfigurationLookup, topLevelModule: string | undefined): ConfigurationLookup | undefined => {
    const result = { ...lookup };
    if (isNullOrWhiteSpace(topLevelModule)) {
      delete result._default;
    } else {
      delete result[topLevelModule];
    }
    return Object.keys(result).length > 0
      ? result
      : undefined;
  };

  setConfigLookupAsync = async (type: string, id: ConfigurableItemIdentifier, configuration: ConfigurationDto, topLevelModule?: string): Promise<void> => {
    const cache = this.#cacheProvider.getCache(`${type}${LOOKUP_SUFFIX}`);
    if (isConfigurableItemFullName(id)) {
      const key = this.getCacheKeyByFullName(id.module, id.name);
      const lookup = await cache.getItem<ConfigurationLookup>(key);
      const resolvedModule = configuration.module;

      if (resolvedModule.toLowerCase() !== id.module?.toLowerCase()) {
      // ensure that lookup exists and it points to a correct module
        const newLookup = lookup ?? {};
        const current = this.getLookupModule(newLookup, topLevelModule);
        if (current !== resolvedModule) {
          const updatedLookup = this.setLookupModule(newLookup, topLevelModule, resolvedModule);
          await cache.setItem<ConfigurationLookup>(key, updatedLookup);
        }
      } else {
      // if lookup exists remove record for current top module
        if (lookup) {
          const updatedLookup = this.removeLookupModule(lookup, topLevelModule);
          if (updatedLookup)
            await cache.setItem<ConfigurationLookup>(key, updatedLookup);
          else
            await cache.removeItem(key);
        }
      }

      await this.setConfigRawIdLookupAsync(type, configuration.id, { module: configuration.module, name: configuration.name });
    }

    if (isConfigurableItemRawId(id)) {
      await this.setConfigRawIdLookupAsync(type, id, { module: configuration.module, name: configuration.name });
    }
  };

  getConfigLookupModuleAsync = async (type: string, id: ConfigurableItemFullName, topLevelModule?: string): Promise<string | undefined> => {
    const lookup = await this.getConfigLookupAsync(type, id);
    if (!lookup) return undefined;
    return topLevelModule
      ? lookup[topLevelModule]
      : lookup._default;
  };

  cleanConfigLookupAsync = async (type: string, id: ConfigurableItemIdentifier): Promise<void> => {
    if (isConfigurableItemFullName(id)) {
      await this.cleanConfigFullNameLookupAsync(type, id);
    }
    if (isConfigurableItemRawId(id)) {
      await this.cleanConfigRawIdLookupAsync(type, id);
    }
  };

  cleanConfigFullNameLookupAsync = async (type: string, id: ConfigurableItemFullName): Promise<void> => {
    const cache = this.#cacheProvider.getCache(`${type}${LOOKUP_SUFFIX}`);
    const key = this.getCacheKeyByFullName(id.module, id.name);
    await cache.removeItem(key);
  };

  cleanConfigRawIdLookupAsync = async (type: string, id: ConfigurableItemUid): Promise<void> => {
    const cache = this.#cacheProvider.getCache(`${type}${LOOKUP_SUFFIX}`);
    await cache.removeItem(id);
  };

  getCachedConfigAsync = async <TConfigDto extends ConfigurationDto = ConfigurationDto>(args: GetConfigurationArgs): Promise<IConfigurationItemDto<TConfigDto> | undefined> => {
    const { type, id, topLevelModule } = args;

    const cache = this.#cacheProvider.getCache(type);

    if (isConfigurableItemFullName(id)) {
      const { module, name } = id;
      const lookupModule = await this.getConfigLookupModuleAsync(type, id, topLevelModule);
      const resolvedModule = lookupModule ?? module;

      const key = this.getCacheKeyByFullName(resolvedModule, name);
      return (await cache.getItem<IConfigurationItemDto<TConfigDto>>(key)) as IConfigurationItemDto<TConfigDto> | undefined;
    }

    if (isConfigurableItemRawId(id)) {
      const lookup = await this.getConfigRawIdLookupAsync(type, id);
      if (!lookup)
        return undefined;
      return await this.getCachedConfigAsync<TConfigDto>({ ...args, id: lookup });
    }

    throw new Error('Unknown configuration item identifier');
  };

  addConfigToCacheAsync = async (type: string, id: ConfigurableItemIdentifier, configuration: ConfigurationDto, cacheMd5: string, topLevelModule: string | undefined): Promise<void> => {
    const { module, name } = configuration;
    const cache = this.#cacheProvider.getCache(type);

    const key = this.getCacheKeyByFullName(module, name);
    await cache.setItem<IConfigurationItemDto>(key, { cacheMd5, configuration });

    await this.setConfigLookupAsync(type, id, configuration, topLevelModule);
  };

  fetchConfigFromBackendByRawIdAsync = ({ type, id, md5 }: FetchConfigurationArgs<ConfigurableItemUid>): Promise<HttpResponse<IAjaxResponse<IConfigurationItemDto>>> => {
    const payload: GetConfigPayload = {
      itemType: type,
      id: id,
      md5: md5,
    };
    const url = buildUrl(URLS.GET_CONFIG, payload);
    return this.#httpClient.get<IAjaxResponse<IConfigurationItemDto>>(url);
  };

  fetchConfigFromBackendByFullNameAsync = ({ type, id, md5 }: FetchConfigurationArgs<ConfigurableItemFullName>): Promise<HttpResponse<IAjaxResponse<IConfigurationItemDto>>> => {
    const payload: GetCurrentConfigPayload = {
      itemType: type,
      name: id.name,
      module: id.module ?? "",
      md5: md5,
    };
    const url = buildUrl(URLS.GET_CURRENT_CONFIG, payload);
    return this.#httpClient.get<IAjaxResponse<IConfigurationItemDto>>(url);
  };

  fetchConfigFromBackendAsync = async ({ type, id, cachedConfiguration, topLevelModule }: FetchConfigurationPayload): Promise<IConfigurationItemDto> => {
    try {
      const httpResponse = isConfigurableItemFullName(id)
        ? await this.fetchConfigFromBackendByFullNameAsync({ type, id, md5: cachedConfiguration?.cacheMd5 ?? null })
        : await this.fetchConfigFromBackendByRawIdAsync({ type, id, md5: cachedConfiguration?.cacheMd5 ?? null });

      const response = httpResponse.data;
      if (isAjaxSuccessResponse(response)) {
        const responseData = response.result;
        if (!isDefined(responseData)) throw 'Failed to fetch configuration. Response is empty';

        await this.addConfigToCacheAsync(type, id, responseData.configuration, responseData.cacheMd5, topLevelModule);

        return responseData;
      } else {
        throw new Error("Failed to fetch configuration: " + response.error.message || "unknown error", { cause: response.error });
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        switch (e.status) {
          case 304:
            if (cachedConfiguration) {
              // TODO: call post-processor
              return cachedConfiguration;
            } else
              throw new Error('Unknown cache error', { cause: e });
          case 400:
            throw new ConfigurationLoadingError(getConfigurationNotFoundMessage(type, id), e.status, { cause: e });
          case 404:
            throw new ConfigurationLoadingError(getConfigurationNotFoundMessage(type, id), e.status, { cause: e });
          case 401:
          case 403:
            throw new ConfigurationLoadingError(getConfigurationNotFoundMessage(type, id), e.status, { cause: e });
        }
      }
      throw e;
    }
  };

  getExistingConfigRequestKey = (id: ConfigurableItemIdentifier, topLevelModule: string | undefined): string => {
    const idText = isConfigurableItemFullName(id)
      ? `${id.module}/${id.name}`
      : id;

    return topLevelModule
      ? `${topLevelModule}:${idText}`
      : idText;
  };

  getExistingRequests = (type: string): IConfigurationRequests => {
    const result = this.#requests.get(type);
    if (result)
      return result;
    const requests = {};
    this.#requests.set(type, requests);
    return requests;
  };

  getExistingConfigRequest = ({ type, id, topLevelModule }: GetConfigurationArgs): PromisedValue<ConfigurationDto> | undefined => {
    const requests = this.getExistingRequests(type);
    const key = this.getExistingConfigRequestKey(id, topLevelModule);
    return requests[key];
  };

  setConfigRequest = (type: string, id: ConfigurableItemIdentifier, topLevelModule: string | undefined, promise: PromisedValue<ConfigurationDto>): void => {
    const requests = this.getExistingRequests(type);
    const key = this.getExistingConfigRequestKey(id, topLevelModule);
    requests[key] = promise;
    promise.catch((e) => {
      // schedule removal of current request from cache after 10 seconds
      setTimeout(() => {
        if (requests[key] === promise)
          requests[key] = undefined;
      }, 10000);
      throw e;
    });
  };

  getCurrentConfigAsync = <TConfigDto extends ConfigurationDto = ConfigurationDto>(args: GetConfigurationArgs): PromisedValue<TConfigDto> => {
    const { id, type, topLevelModule, skipCache } = args;

    if (!skipCache) {
      const existingRequest = this.getExistingConfigRequest(args);
      if (existingRequest)
        return existingRequest as PromisedValue<TConfigDto>;
    }

    const wrappedPromise = new StatefulPromise<TConfigDto>((resolve, reject) => {
      this.getCachedConfigAsync<TConfigDto>(args)
        .then((cachedConfig) => {
          this.fetchConfigFromBackendAsync({ type, id, cachedConfiguration: cachedConfig })
            .then((response) => {
              resolve(response.configuration as TConfigDto);
            })
            .catch(reject);
        })
        .catch(reject);
    });
    this.setConfigRequest(type, id, topLevelModule, wrappedPromise);

    return wrappedPromise;
  };
};
