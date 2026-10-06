import { ActionParametersDictionary, HttpClientApi, IConfigurableTheme } from "@/providers";
import { FormItem, FormProcessingItem, ValidationResult } from "./models";
import { JsonLogicTree } from "@react-awesome-query-builder/antd";
import { extractAjaxResponse, GetAllResponse, IAjaxResponse, IGetAllEntitiesPayload, ISettingsComponent, IToolboxComponentGroup, IToolboxComponents } from "@/interfaces";
import { buildUrl, isDefined } from "@/utils";
import { IFormManagerActionsContext } from "@/providers/formManager/contexts";
import { combineExpressionsWithAnd } from "@/utils/jsonLogic";
import { toolbarGroupsToComponents } from "@/providers/form/hooks";
import { FormValidator } from "@/providers/formDesigner/formValidator";
import { FormBuilderFactory } from "@/form-factory/interfaces";
import { IConfigurableActionDescriptor } from "@/interfaces/configurableAction";
import { IGetConfigurableActionPayload } from "@/providers/configurableActionsDispatcher/contexts";
import { IApplicationContext } from "../..";
import { IConfigurationLoader } from "@/providers/configurationItemsLoader/configurationLoader";
import { isNullOrWhiteSpace } from "@/utils/nullables";

const URLS = {
  GET_ENTITIES: "/api/services/app/Entities/GetAll",
};

const staticFormsFilter = { and: [
  {
    "!=": [
      {
        var: "module",
      },
      null,
    ],
  },
  {
    "==": [
      {
        var: "module.isEditable",
      },
      true,
    ],
  },
  {
    "==": [
      {
        var: "module.isEnabled",
      },
      true,
    ],
  },
  {
    "==": [
      {
        var: "module.isDeleted",
      },
      false,
    ],
  },
  {
    "==": [
      {
        var: "isTemplate",
      },
      false,
    ],
  },
] };

export type BatchFormsValidatorArgs = {
  httpClient: HttpClientApi;
  formManager: IFormManagerActionsContext;
  toolboxComponentGroups: IToolboxComponentGroup[];
  settingsComponents: ISettingsComponent[];
  theme: IConfigurableTheme;
  formBuilderFactory: FormBuilderFactory;
  getConfigurableActionOrNull: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;
  appContext: IApplicationContext;
  configurationLoader: IConfigurationLoader;
};

type FormDto = {
  id: string;
  name: string;
  module: { name: string };
};

export class BatchFormsValidator {
  #httpClient: HttpClientApi;

  #formManager: IFormManagerActionsContext;

  #toolboxComponents: IToolboxComponents;

  #settingsComponents: ISettingsComponent[];

  #formValidator: FormValidator;

  #theme: IConfigurableTheme;

  #appContext: IApplicationContext;

  constructor(args: BatchFormsValidatorArgs) {
    this.#httpClient = args.httpClient;
    this.#formManager = args.formManager;
    this.#toolboxComponents = toolbarGroupsToComponents(args.toolboxComponentGroups);
    this.#settingsComponents = args.settingsComponents;

    this.#formValidator = new FormValidator({
      httpClient: args.httpClient,
      toolboxComponents: this.#toolboxComponents,
      settingsComponentGetter: this.getSettingsComponentOrUndefined,
      formBuilderFactory: args.formBuilderFactory,
      getConfigurableActionOrNull: args.getConfigurableActionOrNull,
      appContext: args.appContext,
      configurationLoader: args.configurationLoader,
    });
    this.#theme = args.theme;
    this.#appContext = args.appContext;
  }

  private getSettingsComponentOrUndefined = (type: string): ISettingsComponent | undefined => {
    return this.#settingsComponents.find((c) => c.type === type);
  };

  loadFormsListAsync = async (filter: JsonLogicTree | undefined, transformItem?: (item: FormItem) => FormProcessingItem): Promise<FormProcessingItem[]> => {
    const finalFilter = isDefined(filter) ? combineExpressionsWithAnd([staticFormsFilter, filter]) : staticFormsFilter;
    const payload: IGetAllEntitiesPayload = {
      name: "FormConfiguration",
      module: "Shesha",
      filter: JSON.stringify(finalFilter),
      sorting: "module.name, name",
      properties: "id name module { name }",
      skipCount: 0,
      maxResultCount: -1,
    };
    const url = buildUrl(URLS.GET_ENTITIES, payload);
    const response = await this.#httpClient.get<IAjaxResponse<GetAllResponse<FormDto>>>(url);
    const data = extractAjaxResponse(response.data);

    const forms: FormProcessingItem[] = [];
    data.items.forEach((form) => {
      if (!isDefined(form.module))
        return undefined;
      const item: FormItem = {
        id: form.id,
        name: form.name,
        module: form.module.name,
      };
      forms.push(transformItem ? transformItem(item) : item as FormProcessingItem);
    });
    return forms;
  };

  processItem = async (item: FormProcessingItem): Promise<ValidationResult> => {
    // 1. fetch markup
    const form = await this.#formManager.getFormById({ formId: item.id, skipCache: false });

    // 2. validate markup and settings
    const { flatStructure, settings } = form;
    if (isNullOrWhiteSpace(form.id))
      throw new Error("Form id is not defined");

    return await this.#formValidator.validateFormAsync(
      form.id,
      flatStructure,
      settings,
      { appContext: this.#appContext, theme: this.#theme },
    );
  };
}
