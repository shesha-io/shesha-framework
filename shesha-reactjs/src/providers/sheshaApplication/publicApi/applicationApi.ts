import { CurrentUserApi, IInternalCurrentUserApi } from './currentUser/api';
import { SettingsApi } from './settings/api';
import { HttpClientApi } from '@/publicJsApis/apis/httpClient';
import { EntitiesApi } from './entities/api';
import { UtilsApi, IUtilsApi } from './utils/api';
import { FormsApi, IFormsApi } from './forms/api';
import { ICacheProvider, IEntityMetadataFetcher } from '@/providers/metadataDispatcher/entities/models';
import { NavigatorApi, INavigatorApi } from './navigator/api';
import { IShaRouter } from '@/providers/shaRouting/contexts';
import { IMetadataDispatcher } from '@/providers/metadataDispatcher/contexts';
import { FormBuilderFactory } from '@/form-factory/interfaces';
import { IDataContextFull } from '@/providers/dataContextProvider/contexts';
import { IDataContextDescriptor } from '@/providers/dataContextManager/models';

export interface IApplicationPlugin {
  name: string;
  data: unknown;
}

export interface IApplicationApi {
  user: IInternalCurrentUserApi;
  settings: SettingsApi;
  entities: EntitiesApi;
  navigator: INavigatorApi;
  readonly context: IDataContextFull;

  addPlugin: (plugin: IApplicationPlugin) => void;
  removePlugin: (pluginName: string) => void;
}

export class ApplicationApi implements IApplicationApi {
  public user: IInternalCurrentUserApi;

  public settings: SettingsApi;

  public entities: EntitiesApi;

  public utils: IUtilsApi;

  public forms: IFormsApi;

  public navigator: INavigatorApi;

  private contextDescriptor: IDataContextDescriptor | undefined;

  public get context(): IDataContextFull {
    return this.contextDescriptor?.getFull() ?? { };
  };

  readonly #httpClient: HttpClientApi;

  readonly #plugins: Map<string, IApplicationPlugin>;

  constructor(
    httpClient: HttpClientApi,
    cacheProvider: ICacheProvider,
    metadataFetcher: IEntityMetadataFetcher,
    shaRouter: IShaRouter,
    metadataDispatcher: IMetadataDispatcher,
    contextDescriptor: IDataContextDescriptor | undefined,
    fbf: FormBuilderFactory,
  ) {
    this.#plugins = new Map<string, IApplicationPlugin>();

    this.#httpClient = httpClient;
    this.user = new CurrentUserApi(this.#httpClient);
    this.settings = new SettingsApi(this.#httpClient);
    this.entities = new EntitiesApi(this.#httpClient, cacheProvider, metadataFetcher);
    this.forms = new FormsApi(this.#httpClient, metadataDispatcher, fbf);
    this.utils = new UtilsApi(this.#httpClient);
    this.navigator = new NavigatorApi(shaRouter);
    this.contextDescriptor = contextDescriptor;
  }

  addPlugin(plugin: IApplicationPlugin): void {
    if (this.#plugins.has(plugin.name)) throw new Error(`Plugin with name '${plugin.name}' already registered`);
    this.#plugins.set(plugin.name, plugin);

    Object.defineProperty(this, plugin.name, {
      get() {
        return plugin.data;
      },
    });
  }

  removePlugin(pluginName: string): void {
    if (!this.#plugins.has(pluginName)) throw new Error(`Plugin with name '${pluginName}' is not registered`);

    this.#plugins.delete(pluginName);
    delete this[pluginName as keyof IApplicationApi];
  }
}
