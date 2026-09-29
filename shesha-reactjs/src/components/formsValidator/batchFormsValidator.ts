import { ActionParametersDictionary, FormMarkup, HttpClientApi, IConfigurableTheme } from "@/providers";
import { FormItem, FormProcessingItem, ValidationResult } from "./models";
import { JsonLogicTree } from "@react-awesome-query-builder/antd";
import { extractAjaxResponse, GetAllResponse, IAjaxResponse, IGetAllEntitiesPayload, ISettingsComponent, IToolboxComponentGroup, IToolboxComponents } from "@/interfaces";
import { buildUrl, isDefined } from "@/utils";
import { IFormManagerActionsContext } from "@/providers/formManager/contexts";
import { combineExpressionsWithAnd } from "@/utils/jsonLogic";
import { toolbarGroupsToComponents } from "@/providers/form/hooks";
import { ComponentValidationContext, FormValidator } from "@/providers/formDesigner/formValidator";
import { FormBuilderFactory } from "@/form-factory/interfaces";
import { IConfigurableActionDescriptor } from "@/interfaces/configurableAction";
import { IGetConfigurableActionPayload } from "@/providers/configurableActionsDispatcher/contexts";
import { getFormSettingsFormMarkup } from "../formDesigner/formSettings";
import { ConfigurationIssue } from "@/providers/formDesigner/models";
import { extractErrorMessage } from "@/utils/errors";
import { IApplicationContext } from "../..";

const URLS = {
  GET_ENTITIES: "/api/services/app/Entities/GetAll",
  UPDATE_FORM_VALIDATION_RESULTS: "/api/services/Shesha/FormConfiguration/UpdateValidationResults",
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

  #formSettingsFormMarkup: FormMarkup;

  #appContext: IApplicationContext;

  constructor(args: BatchFormsValidatorArgs) {
    this.#httpClient = args.httpClient;
    this.#formManager = args.formManager;
    this.#formSettingsFormMarkup = getFormSettingsFormMarkup({ fbf: args.formBuilderFactory });

    this.#toolboxComponents = toolbarGroupsToComponents(args.toolboxComponentGroups);
    this.#settingsComponents = args.settingsComponents;

    this.#formValidator = new FormValidator({
      toolboxComponents: this.#toolboxComponents,
      settingsComponentGetter: this.getSettingsComponentOrUndefined,
      formBuilderFactory: args.formBuilderFactory,
      getConfigurableActionOrNull: args.getConfigurableActionOrNull,
      appContext: args.appContext,
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

    // 3. collect static (list of used components, etc.)
    const issues: ConfigurationIssue[] = [];
    const validationContext: ComponentValidationContext = {
      path: [],
      isSettingsForm: settings.isSettingsForm === true,
      theme: this.#theme,
      formFlatMarkup: flatStructure,
      appContext: this.#appContext,
    };
    try {
      await this.#formValidator.validateAllComponentsAsync(flatStructure,
        validationContext,
        (component, errors) => {
          errors.forEach((e) => {
            issues.push({
              severity: "error",
              location: component.id,
              property: e.field,
              message: e.message,
            });
          });
        },
      );
    } catch (error) {
      console.error(`Validation of form '${item.module}/${item.name}' failed, id: '${item.id}'`, error);
      throw error;
    }

    const settingsErrors = await this.#formValidator.validateFormSettingsAsync(settings, this.#formSettingsFormMarkup);
    settingsErrors.forEach((e) => {
      issues.push({
        severity: "error",
        location: "settings",
        property: e.field,
        message: e.message,
      });
    });

    // 4. save results on back-end
    await this.saveValidationResultsAsync(item.id, issues);

    // 5. return results
    return { issues };
  };

  saveValidationResultsAsync = async (formId: string, issues: ConfigurationIssue[]): Promise<void> => {
    try {
      const response = await this.#httpClient.post<IAjaxResponse<void>>(URLS.UPDATE_FORM_VALIDATION_RESULTS, { id: formId, issues });
      extractAjaxResponse(response.data);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  };
}
