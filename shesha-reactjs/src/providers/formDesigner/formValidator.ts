
import {
  ActionParametersDictionary,
  ConfigurableItemFullName,
  extractAjaxResponse,
  FormMarkup,
  IAjaxResponse,
  IAsyncValidationError,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings,
  IFormValidationRulesOptions,
  isConfigurableFormComponent,
  IToolboxComponents,
  ValidationNodeRef } from "@/interfaces";
import { isDefined } from "@/utils";
import { getContextualConfigurableActionGetter, IApplicationContext, isValidationError, validateConfigurableComponentSettings, EnhancedValidateError } from "../form/utils";
import { FormDesignerComponentGetter, SettingsComponentGetter } from "../form/hooks";
import { DeviceTypes } from "../canvas/contexts";
import { IConfigurableTheme } from "../theme";
import { getEffectiveStyle } from "@/utils/style";
import { FormBuilderFactory } from "@/form-factory/interfaces";
import { IGetConfigurableActionPayload } from "../configurableActionsDispatcher/contexts";
import { IConfigurableActionDescriptor } from "@/interfaces/configurableAction";
import { ConfigurableActionGetter } from "../configurableActionsDispatcher/models";
import { IAmbientScopeProvider } from "@/utils/ambientScopeProvider";
import { ComponentValidationError } from "@/utils/validation";
import { IConfigurationLoader } from "../configurationItemsLoader/configurationLoader";
import { FormDependency, UpdateFormDependenciesInput, ValidationResult } from "@/components/formsValidator/models";
import { ConfigurationIssue } from "./models";
import { getFormSettingsFormMarkup } from "@/components/formDesigner/formSettings";
import { HttpClientApi } from "../sheshaApplication/publicApi";
import { extractErrorMessage } from "@/utils/errors";
import { DependenciesTracker } from "./dependencyTracker";

const URLS = {
  UPDATE_FORM_VALIDATION_RESULTS: "/api/services/Shesha/FormConfiguration/UpdateValidationResults",
  UPDATE_FORM_DEPENDENCIES_RESULTS: '/api/services/Shesha/FormConfiguration/UpdateDependencies',
};

export type ValidationEnvironment = {
  deviceType?: DeviceTypes | undefined;
  theme: IConfigurableTheme;
  appContext: IApplicationContext;
};

export type IDependenciesTracker = {
  add: (dependency: FormDependency) => void;
  addEntityReference: (entityType: ConfigurableItemFullName | string, isSatisfied: boolean) => void;
  addReferenceList: (id: ConfigurableItemFullName, isSatisfied: boolean) => void;
  addForm: (id: ConfigurableItemFullName, isSatisfied: boolean) => void;
  addFormComponent: (type: string, isSatisfied: boolean, hasIssues: boolean) => void;

  readonly dependencies: FormDependency[];
};
export const NULL_DEPENDENCIES_CONTEXT: IDependenciesTracker = {
  add: () => { },
  addEntityReference: () => { },
  addReferenceList: () => { },
  addForm: () => { },
  addFormComponent: () => { },
  dependencies: [],
};

export type ComponentValidationContext = ValidationEnvironment & {
  path: ValidationNodeRef[];
  isSettingsForm: boolean;
  formFlatMarkup: IFlatComponentsStructure;
  scopeProvider?: IAmbientScopeProvider<object>;
  dependencies: IDependenciesTracker;
};

export type OnComponentValidated = (component: IConfigurableFormComponent, errors: IAsyncValidationError[]) => void;

export type FormValidatorArgs = {
  httpClient: HttpClientApi;
  toolboxComponents: IToolboxComponents;
  settingsComponentGetter: SettingsComponentGetter;
  formBuilderFactory: FormBuilderFactory;
  getConfigurableActionOrNull: ConfigurableActionGetter;
  appContext: IApplicationContext;
  configurationLoader: IConfigurationLoader;
};

export interface IFormValidator {
  validateAllComponentsAsync: (formFlatMarkup: IFlatComponentsStructure, context: ComponentValidationContext, onComponentValidated?: OnComponentValidated) => Promise<void>;
  validateComponentAsync: (component: IConfigurableFormComponent, context: ComponentValidationContext) => Promise<IAsyncValidationError[]>;
  validateModelAsync: <TModel extends object = object>(model: TModel, markup: FormMarkup, context: IFormValidationRulesOptions<TModel>) => Promise<IAsyncValidationError[]>;
  validateFormAsync: (formId: string, flatStructure: IFlatComponentsStructure, settings: IFormSettings, env: ValidationEnvironment) => Promise<ValidationResult>;

  getConfigurableActionOrNull: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;
  readonly componentGetter: FormDesignerComponentGetter;
  readonly settingComponentGetter: SettingsComponentGetter;
  readonly formBuilderFactory: FormBuilderFactory;
  readonly configurationLoader: IConfigurationLoader;
}

export class FormValidator implements IFormValidator {
  #httpClient: HttpClientApi;

  #toolboxComponents: IToolboxComponents;

  #componentGetter: FormDesignerComponentGetter;

  #settingsComponentGetter: SettingsComponentGetter;

  #formBuilderFactory: FormBuilderFactory;

  #formSettingsFormMarkup: FormMarkup;

  #appContext: IApplicationContext;

  #configurationLoader: IConfigurationLoader;

  #getConfigurableActionOrNull: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;

  constructor(args: FormValidatorArgs) {
    this.#httpClient = args.httpClient;
    this.#toolboxComponents = args.toolboxComponents;
    this.#componentGetter = (type) => (this.#toolboxComponents[type]);
    this.#settingsComponentGetter = args.settingsComponentGetter;
    this.#formBuilderFactory = args.formBuilderFactory;
    this.#formSettingsFormMarkup = getFormSettingsFormMarkup({ fbf: args.formBuilderFactory });
    this.#getConfigurableActionOrNull = args.getConfigurableActionOrNull;
    this.#appContext = args.appContext;
    this.#configurationLoader = args.configurationLoader;
  }

  get configurationLoader(): IConfigurationLoader {
    return this.#configurationLoader;
  }

  get getConfigurableActionOrNull(): <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => (IConfigurableActionDescriptor<TArguments> | null) {
    return this.#getConfigurableActionOrNull;
  };

  get componentGetter(): FormDesignerComponentGetter {
    return this.#componentGetter;
  }

  get settingComponentGetter(): SettingsComponentGetter {
    return this.#settingsComponentGetter;
  }

  get formBuilderFactory(): FormBuilderFactory {
    return this.#formBuilderFactory;
  }

  validateAllComponentsAsync = async (formFlatMarkup: IFlatComponentsStructure, context: ComponentValidationContext, onComponentValidated?: OnComponentValidated): Promise<void> => {
    const { allComponents } = formFlatMarkup;
    for (const key in allComponents) {
      if (allComponents.hasOwnProperty(key)) {
        const item = allComponents[key];
        if (isConfigurableFormComponent(item)) {
          const errors = await this.validateComponentAsync(item, context);
          if (isDefined(onComponentValidated))
            onComponentValidated(item, errors);
        }
      }
    }
  };

  validateModelAsync = async <TModel extends object = object>(model: TModel, markup: FormMarkup, context: IFormValidationRulesOptions<TModel>): Promise<IAsyncValidationError[]> => {
    const validationErrors: IAsyncValidationError[] = [];
    try {
      await validateConfigurableComponentSettings(markup, model, context);
    } catch (error: unknown) {
      if (isValidationError(error)) {
        error.errors.forEach((fieldError) => {
          if (fieldError instanceof ComponentValidationError) {
            validationErrors.push(fieldError);
          } else {
            const fieldLabel = (fieldError as EnhancedValidateError).fieldLabel;
            validationErrors.push(new ComponentValidationError(fieldError.message ?? "Unknown error", context.path, fieldError.field, fieldLabel));
          }
        });
      } else {
        console.error('Unknown error ocurred while validating settings', error);
      }
    }
    return validationErrors;
  };

  validateComponentAsync = async <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(component: TModel, context: ComponentValidationContext): Promise<IAsyncValidationError[]> => {
    const toolboxComponent = this.#componentGetter(component.type);

    const componentRef: ValidationNodeRef = {
      id: component.id,
      kind: 'component',
      name: component.componentName ?? '[no-name]',
      label: typeof (component.label) === "string"
        ? component.label
        : undefined,
    };
    const path: ValidationNodeRef[] = [
      ...context.path,
      componentRef,
    ];

    const validationErrors: IAsyncValidationError[] = [];
    if (isDefined(toolboxComponent)) {
      if (isDefined(toolboxComponent.validateModel)) {
        toolboxComponent.validateModel(component, (propertyName, error) => {
          validationErrors.push({ field: propertyName, message: error });
        });
      }

      try {
        if (isDefined(toolboxComponent.settingsFormMarkup)) {
          const settingsFormMarkup = typeof toolboxComponent.settingsFormMarkup === 'function'
            ? toolboxComponent.settingsFormMarkup({ fbf: this.#formBuilderFactory, removeStyleRouter: true })
            : toolboxComponent.settingsFormMarkup;

          const effectiveStyle = getEffectiveStyle(component, context.deviceType ?? 'desktop', context.theme, toolboxComponent, context.isSettingsForm);
          const modelWithInheritedValues = { ...component, ...effectiveStyle };

          await validateConfigurableComponentSettings(settingsFormMarkup, modelWithInheritedValues, {
            path,
            validator: this,
            componentId: component.id,
            contextConfigurableActionGetter: getContextualConfigurableActionGetter(context.formFlatMarkup, this.#componentGetter),
            appContext: context.appContext,
            dependencies: context.dependencies,
          });
        }
      } catch (error: unknown) {
        if (isValidationError(error)) {
          error.errors.forEach((fieldError) => {
            validationErrors.push(ComponentValidationError.wrap(fieldError, path));
          });
        } else {
          console.error('Unknown error ocurred while validating settings', error);
        }
      }
    } else
      validationErrors.push({
        message: `Unknown component type: '${component.type}'`,
        field: "",
        path: path,
      });

    return validationErrors;
  };

  validateFormSettingsAsync = async (formSettings: IFormSettings, markup: FormMarkup): Promise<IAsyncValidationError[]> => {
    const validationErrors: IAsyncValidationError[] = [];
    const rootPath: ValidationNodeRef[] = [{
      id: '',
      kind: 'form-settings',
      name: 'settings',
      label: 'Form Settings',
    }];
    try {
      await validateConfigurableComponentSettings(markup, formSettings, {
        validator: this,
        contextConfigurableActionGetter: () => null,
        componentId: "",
        appContext: this.#appContext,
        path: rootPath,
        dependencies: NULL_DEPENDENCIES_CONTEXT,
      });
    } catch (error: unknown) {
      if (isValidationError(error)) {
        error.errors.forEach((fieldError) => {
          validationErrors.push(ComponentValidationError.wrap(fieldError, rootPath));
        });
      } else {
        console.error('Unknown error ocurred while validating settings', error);
      }
    }
    return validationErrors;
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

  saveDependenciesAsync = async (formId: string, dependencies: FormDependency[]): Promise<void> => {
    try {
      const response = await this.#httpClient.post<IAjaxResponse<void>, UpdateFormDependenciesInput>(URLS.UPDATE_FORM_DEPENDENCIES_RESULTS, { id: formId, dependencies });
      extractAjaxResponse(response.data);
    } catch (error) {
      console.error(extractErrorMessage(error));
      throw error;
    }
  };

  validateFormAsync = async (formId: string, flatStructure: IFlatComponentsStructure, settings: IFormSettings, env: ValidationEnvironment): Promise<ValidationResult> => {
    const issues: ConfigurationIssue[] = [];
    const deps: IDependenciesTracker = new DependenciesTracker();
    const validationContext: ComponentValidationContext = {
      ...env,
      path: [],
      isSettingsForm: settings.isSettingsForm === true,
      formFlatMarkup: flatStructure,
      dependencies: deps,
    };
    await this.validateAllComponentsAsync(flatStructure,
      validationContext,
      (component, errors) => {
        const componentType = this.#componentGetter(component.type);
        deps.addFormComponent(component.type, isDefined(componentType), errors.length > 0);

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

    const settingsErrors = await this.validateFormSettingsAsync(settings, this.#formSettingsFormMarkup);
    settingsErrors.forEach((e) => {
      issues.push({
        severity: "error",
        location: "settings",
        property: e.field,
        message: e.message,
      });
    });

    await this.saveValidationResultsAsync(formId, issues);

    await this.saveDependenciesAsync(formId, deps.dependencies);

    return { issues };
  };
}
