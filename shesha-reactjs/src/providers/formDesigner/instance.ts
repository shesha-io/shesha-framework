/* eslint-disable no-console */
/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import {
  ActionParametersDictionary, FieldValidationError, FormMarkup,
  FormMarkupWithSettings,
  FormMode,
  IAsyncValidationError,
  IComponentRelations,
  IComponentsDictionary,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings, IRawComponentsContainer,
  isConfigurableFormComponent,
  ISettingsComponent,
  ISettingsFormFactory,
  isRawComponentsContainer,
  IToolboxComponent,
  IToolboxComponentGroup,
  IToolboxComponents,
  ROOT_COMPONENT_KEY,
  ValidationNodeRef,
} from "@/interfaces";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { camelcaseDotNotation } from '@/utils/string';
import { nanoid } from "@/utils/uuid";
import { FormDesignerComponentGetter, toolbarGroupsToComponents } from "../form/hooks";
import { componentsFlatStructureToTree, createComponentModelForDataProperty, IApplicationContext, processRecursive, upgradeComponent } from "../form/utils";
import {
  FormDesignerFormState,
  IAddDataPropertyPayload,
  IComponentAddPayload,
  IComponentDeletePayload,
  IComponentDuplicatePayload,
  IComponentUpdatePayload,
  IValidationResultsPayload,
  IFormDesignerInstance,
  IUpdateChildComponentsPayload,
  VALIDATABLE_ITEM_TYPES,
} from "./contexts";
import { BaseHistoryItem, FormDesignerSubscription, FormDesignerSubscriptionType, IComponentSettingsEditorsCache } from "./models";
import { IUndoRedoManager, UndoRedoManager } from "./undoRedoManager";
import { IFormPersisterContext } from "../formPersisterProvider/contexts";
import { ValidationCollector } from "../validator";
import { IValidationCollector } from "../validator/interfaces";
import { FormBuilderFactory } from "@/form-factory/interfaces";
import { getFormSettingsFormMarkup } from "@/components/formDesigner/formSettings";
import { ReactNode } from "react";
import { IConfigurableTheme } from "../theme";
import { DeviceTypes } from "../canvas/contexts";
import { IGetConfigurableActionPayload } from "../configurableActionsDispatcher/contexts";
import { IConfigurableActionDescriptor } from "@/interfaces/configurableAction";
import { ComponentValidationContext, FormValidator, NULL_DEPENDENCIES_CONTEXT, ValidationEnvironment } from "./formValidator";
import { isNonEmptyArray } from "@/utils/array";
import { AmbientScopeProvider } from "@/utils/ambientScopeProvider";
import { IConfigurationLoader } from "../configurationItemsLoader/configurationLoader";
import { HttpClientApi } from "../sheshaApplication/publicApi";

export type FormDesignerArgs = {
  httpClient: HttpClientApi;
  readOnly: boolean;
  toolboxComponentGroups: IToolboxComponentGroup[];
  settingsComponents: ISettingsComponent[];
  formFlatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  logEnabled?: boolean;
  formPersister: IFormPersisterContext;
  formBuilderFactory: FormBuilderFactory;
  theme: IConfigurableTheme;
  activeDevice: DeviceTypes | undefined;
  getConfigurableActionOrNull: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;
  appContext: IApplicationContext;
  configurationLoader: IConfigurationLoader;
};

const isComponentsArray = (value: unknown): value is IConfigurableFormComponent[] => {
  return Array.isArray(value) && value.every(isConfigurableFormComponent);
};

type IPlainComponentsContainer = {
  id: string;
  components: IConfigurableFormComponent[];
};
const isPlainContainer = (value: unknown): value is IPlainComponentsContainer => {
  return isDefined(value) && typeof (value) === 'object' && 'components' in value && isComponentsArray(value.components) &&
    'id' in value && typeof (value.id) === 'string';
};

const idArraysEqual = (array1: string[], array2: string[]): boolean => {
  return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
};

export class FormDesignerInstance implements IFormDesignerInstance {
  undoableState: IUndoRedoManager<FormDesignerFormState>;

  toolboxComponentGroups: IToolboxComponentGroup[];

  toolboxComponents: IToolboxComponents;

  settingsComponents: ISettingsComponent[];

  formPersister: IFormPersisterContext;

  isDragging: boolean;

  hasDragged: boolean;

  isDebug: boolean;

  readOnly: boolean;

  formMode: FormMode;

  isFormSettingsVisible: boolean = false;

  validationCollector: IValidationCollector;

  formBuilderFactory: FormBuilderFactory;

  theme: IConfigurableTheme;

  activeDevice: DeviceTypes | undefined;

  getConfigurableActionOrNull: <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;

  formValidator: FormValidator;

  appContext: IApplicationContext;

  formSettingsFormMarkup: FormMarkup;

  get state(): FormDesignerFormState {
    return this.undoableState.getState();
  }

  closeFormSettings = (): void => {
    this.isFormSettingsVisible = false;
    this.notifySubscribers(['settings']);
  };

  openFormSettings = (): void => {
    this.isFormSettingsVisible = true;
    this.notifySubscribers(['settings']);
  };

  constructor(args: FormDesignerArgs) {
    this.toolboxComponentGroups = args.toolboxComponentGroups;
    this.toolboxComponents = toolbarGroupsToComponents(args.toolboxComponentGroups);
    this.settingsComponents = args.settingsComponents;
    this.formPersister = args.formPersister;
    this.readOnly = args.readOnly;
    this.isDebug = false;
    this.formMode = 'designer';
    this.isDragging = false;
    this.hasDragged = false;
    this.isDataModified = false;
    this.subscriptions = new Map<FormDesignerSubscriptionType, Set<FormDesignerSubscription>>();
    this.validationCollector = new ValidationCollector();
    this.formBuilderFactory = args.formBuilderFactory;
    this.theme = args.theme;
    this.activeDevice = args.activeDevice;
    this.getConfigurableActionOrNull = args.getConfigurableActionOrNull;
    this.formValidator = new FormValidator({
      httpClient: args.httpClient,
      toolboxComponents: this.toolboxComponents,
      settingsComponentGetter: this.getSettingsComponentOrUndefined,
      formBuilderFactory: this.formBuilderFactory,
      getConfigurableActionOrNull: this.getConfigurableActionOrNull,
      appContext: args.appContext,
      configurationLoader: args.configurationLoader,
    });
    this.appContext = args.appContext;

    this.formSettingsFormMarkup = getFormSettingsFormMarkup({ fbf: this.formBuilderFactory });


    this.log = args.logEnabled === true ? console.log : () => { };

    const initialState: FormDesignerFormState = {
      formFlatMarkup: args.formFlatMarkup,
      formSettings: args.formSettings,
    };
    this.undoableState = new UndoRedoManager<FormDesignerFormState>(initialState);
    void this.validateFormAsync();
  }

  isDataModified: boolean;

  loadAsync = async (): Promise<void> => {
    await this.formPersister.loadForm({ skipCache: true });
    this.isDataModified = false;
    this.notifySubscribers(['data-modified']);
  };

  saveAsync = async (): Promise<void> => {
    const { formFlatMarkup, formSettings } = this.state;
    const payload: FormMarkupWithSettings = {
      components: componentsFlatStructureToTree(this.toolboxComponents, formFlatMarkup),
      formSettings: formSettings,
    };
    await this.formPersister.saveForm(payload);
    this.isDataModified = false;
    this.notifySubscribers(['data-modified']);
  };

  log = (..._args: unknown[]): void => {
    // noop
  };

  setMarkupAndSettings = (flatMarkup: IFlatComponentsStructure, settings: IFormSettings): void => {
    this.log('FD: setMarkupAndSettings', flatMarkup, settings);

    this.undoableState.setState({
      formFlatMarkup: flatMarkup,
      formSettings: settings,
    });
    this.selectedComponentId = undefined;
    this.isDataModified = false;
    this.notifySubscribers(['markup', 'selection', 'history', 'data-modified']);
    void this.validateFormAsync();
  };

  selectedComponentId: string | undefined;

  settingsPanelElement: HTMLDivElement | null = null;

  setSettingsPanelElement = (element: HTMLDivElement | null): void => {
    this.settingsPanelElement = element;
    this.notifySubscribers(['selection']);
  };

  private getToolboxComponentOrUndefined = (type: string): IToolboxComponent | undefined => {
    return this.toolboxComponents[type];
  };

  private getSettingsComponentOrUndefined = (type: string): ISettingsComponent | undefined => {
    return this.settingsComponents.find((c) => c.type === type);
  };

  private getToolboxComponent = (type: string): IToolboxComponent => {
    const component = this.getToolboxComponentOrUndefined(type);
    if (!isDefined(component))
      throw new Error(`Cannot find toolbox component with type ${type}`);
    return component;
  };

  private getComponentOrContainer = (id: string): IConfigurableFormComponent | IRawComponentsContainer => {
    const { formFlatMarkup } = this.state;
    const component = formFlatMarkup.allComponents[id];
    if (!isDefined(component))
      throw new Error(`Cannot find component with id ${id}`);
    return component;
  };

  private componentExists = (id: string): boolean => {
    return isDefined(this.getComponentOrContainer(id));
  };

  private getComponent = (id: string): IConfigurableFormComponent => {
    const result = this.getComponentOrContainer(id);
    if (!isConfigurableFormComponent(result))
      throw new Error(`Item with id ${id} is not a configurable form component`);

    return result;
  };

  private setParentId = (item: IConfigurableFormComponent | IRawComponentsContainer, parentId: string): void => {
    if ("parentId" in item && typeof (item.parentId) === "string")
      item.parentId = parentId;
  };

  private cloneComponent = <TC extends IConfigurableFormComponent | IRawComponentsContainer = IConfigurableFormComponent | IRawComponentsContainer>(
    component: TC,
    nestedComponents: IComponentsDictionary,
    nestedRelations: IComponentRelations,
  ): TC => {
    const newId = nanoid();
    const clone: TC = { ...component, id: newId };

    nestedComponents[newId] = clone;

    const { formFlatMarkup } = this.state;

    // handle nested components by id of the parent
    const srcNestedComponents = formFlatMarkup.componentRelations[component.id];
    if (srcNestedComponents) {
      const relations: string[] = [];
      nestedRelations[clone.id] = relations;

      srcNestedComponents.forEach((childId) => {
        const child = this.getComponentOrContainer(childId);
        const childClone = this.cloneComponent(child, nestedComponents, nestedRelations);
        this.setParentId(childClone, clone.id);

        relations.push(childClone.id);
      });
    }

    // component.type is empty for raw containers
    if (isConfigurableFormComponent(component) && !isNullOrWhiteSpace(component.type)) {
      if (!isConfigurableFormComponent(clone))
        throw new Error('Clone is not a configurable form component');

      const toolboxComponent = this.getToolboxComponent(component.type);

      const containers = toolboxComponent.customContainerNames ?? [];
      // handle containers
      containers.forEach((key) => {
        const cntName = key as keyof IConfigurableFormComponent;
        const srcContainer = cntName in component && typeof (component[cntName]) === 'object' && (isConfigurableFormComponent(component[cntName]) || isRawComponentsContainer(component[cntName]) || Array.isArray(component[cntName]))
          ? component[cntName]
          : undefined;
        if (srcContainer) {
          // add clone recursively
          const relations: string[] = [];
          nestedRelations[clone.id] = relations;

          const cloneChild = <T extends IConfigurableFormComponent | IRawComponentsContainer = IConfigurableFormComponent | IRawComponentsContainer>(c: T): T => {
            // child may be component or any object with id
            const childClone = this.cloneComponent<T>(c, nestedComponents, nestedRelations);
            this.setParentId(childClone, clone.id);

            relations.push(childClone.id);

            return childClone;
          };

          if (isConfigurableFormComponent(srcContainer)) {
            (clone[cntName] as IConfigurableFormComponent) = cloneChild(srcContainer);
          } else
            if (isRawComponentsContainer(srcContainer)) {
              (clone[cntName] as IRawComponentsContainer) = cloneChild(srcContainer);
            } else {
              if (Array.isArray(srcContainer)) {
                (clone[cntName] as IConfigurableFormComponent[]) = srcContainer.map((c) => {
                  if (!isConfigurableFormComponent(c))
                    throw new Error('Not configurable form component');
                  return cloneChild(c);
                });
              }
            }
        }
      });
    }
    return clone;
  };

  private getContainerNames = (toolboxComponent: IToolboxComponent): string[] => {
    return toolboxComponent.customContainerNames
      ? [...(toolboxComponent.customContainerNames ?? [])]
      : ['components'];
  };

  private cloneComponents = (components: IConfigurableFormComponent[]): IConfigurableFormComponent[] => {
    const result: IConfigurableFormComponent[] = [];

    components.forEach((component) => {
      const clone: IConfigurableFormComponent = { ...component, id: nanoid() };

      result.push(clone);

      const toolboxComponent = this.getToolboxComponent(component.type);
      const containers = this.getContainerNames(toolboxComponent);

      containers.forEach((cnt) => {
        const containerName = cnt as keyof IConfigurableFormComponent;
        const container: unknown = clone[containerName];

        if (isComponentsArray(container)) {
          const newChilds = this.cloneComponents(clone[containerName] as IConfigurableFormComponent[]);
          (clone[containerName] as IConfigurableFormComponent[]) = newChilds;
        } else
          if (isPlainContainer(container)) {
            const containerClone = { ...container, id: nanoid() };
            containerClone.components = this.cloneComponents(container.components);
            (clone[containerName] as IPlainComponentsContainer) = containerClone;
          }
      });
    });

    return result;
  };

  private addComponentToFlatStructure = (
    formFlatMarkup: IFlatComponentsStructure,
    formComponents: IConfigurableFormComponent[],
    containerId: string,
    index: number,
  ): IFlatComponentsStructure => {
    // build all components dictionary
    const allComponents = { ...formFlatMarkup.allComponents };

    const childRelations: IComponentRelations = {};

    formComponents.forEach((component) => {
      processRecursive(this.toolboxComponentGroups, containerId, component, (cmp, parentId) => {
        allComponents[cmp.id] = cmp;

        if (parentId !== containerId) {
          const relations = childRelations[parentId] ?? [];
          childRelations[parentId] = [...relations, cmp.id];
        }
      });
    });

    const currentLevel = containerId;

    // add component(s) to the parent container
    const containerComponents = isDefined(formFlatMarkup.componentRelations[currentLevel])
      ? [...formFlatMarkup.componentRelations[currentLevel]]
      : [];
    formComponents.forEach((component) => {
      containerComponents.splice(index, 0, component.id);
    });
    const componentRelations = {
      ...formFlatMarkup.componentRelations,
      [currentLevel]: containerComponents,
      ...childRelations,
    };

    return {
      allComponents,
      componentRelations,
      parents: formFlatMarkup.parents,
    };
  };

  deleteComponent = (payload: IComponentDeletePayload): void => {
    this.log('FD: deleteComponent', payload);
    this.updateState((state): FormDesignerFormState => {
      const { formFlatMarkup } = state;
      const { [payload.componentId]: component, ...allComponents } = formFlatMarkup.allComponents;
      if (!component)
        throw new Error(`Cannot find component with id ${payload.componentId}`);

      // delete self as parent
      const componentRelations = { ...formFlatMarkup.componentRelations };
      delete componentRelations[payload.componentId];

      // delete self as child
      if (isConfigurableFormComponent(component) && !isNullOrWhiteSpace(component.parentId)) {
        const parentRelations = [...(componentRelations[component.parentId] ?? [])];
        const childIndex = parentRelations.indexOf(payload.componentId);
        parentRelations.splice(childIndex, 1);

        componentRelations[component.parentId] = parentRelations;
      } else console.warn(`component ${payload.componentId} has no parent`);

      if (this.selectedComponentId === payload.componentId) {
        this.selectedComponentId = undefined; // clear selection if we delete current component
      }
      return {
        ...state,
        formFlatMarkup: {
          allComponents,
          componentRelations,
          parents: formFlatMarkup.parents,
        },
      };
    }, `Removed component ${payload.componentId}`);
  };

  deleteSelectedComponent = (): boolean => {
    if (isDefined(this.selectedComponentId)) {
      this.deleteComponent({ componentId: this.selectedComponentId });
      return true;
    }
    return false;
  };

  getComponentsCount = (components: IComponentsDictionary, type: string): number => {
    let count = 0;
    for (const key in components) {
      if (isDefined(components[key]) && isConfigurableFormComponent(components[key]) && components[key].type === type)
        count++;
    }
    return count;
  };

  generateNewComponentName = (components: IComponentsDictionary, toolboxComponent: IToolboxComponent): string => {
    const count = this.getComponentsCount(components, toolboxComponent.type);
    return `${toolboxComponent.name}${count + 1}`;
  };

  duplicateComponent = (payload: IComponentDuplicatePayload): void => {
    this.log('FD: duplicateComponent', payload);
    this.updateState((state): FormDesignerFormState => {
      const { formFlatMarkup } = state;
      const srcComponent = this.getComponent(payload.componentId);

      const nestedComponents: IComponentsDictionary = {};
      const nestedRelations: IComponentRelations = {};
      const clone = this.cloneComponent(srcComponent, nestedComponents, nestedRelations);

      const toolboxComponent = this.getToolboxComponent(clone.type);
      const componentName = this.generateNewComponentName(formFlatMarkup.allComponents, toolboxComponent);
      clone.componentName = camelcaseDotNotation(componentName);
      clone.label = componentName;

      const parentRelations = !isNullOrWhiteSpace(srcComponent.parentId)
        ? [...(formFlatMarkup.componentRelations[srcComponent.parentId] ?? [])]
        : [];

      const cloneIndex = parentRelations.indexOf(srcComponent.id) + 1;
      parentRelations.splice(cloneIndex, 0, clone.id);

      const componentRelations = {
        ...formFlatMarkup.componentRelations,
        ...(!isNullOrWhiteSpace(srcComponent.parentId) ? { [srcComponent.parentId]: parentRelations } : {}),
        ...nestedRelations,
      };
      const allComponents = {
        ...formFlatMarkup.allComponents,
        [clone.id]: clone,
        ...nestedComponents,
      };

      this.selectedComponentId = clone.id;

      return {
        ...state,
        formFlatMarkup: {
          allComponents,
          componentRelations,
          parents: formFlatMarkup.parents,
        },
      };
    }, `Duplicated component ${payload.componentId}`);
  };

  updateComponent = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(payload: IComponentUpdatePayload<TModel>): void => {
    this.updateState((state): FormDesignerFormState => {
      const { formFlatMarkup } = state;
      const component = this.getComponent(payload.componentId) as TModel;

      const componentJsonBefore = JSON.stringify(component);
      this.log(`FD: updateComponent ${payload.componentId} (${component.type})`, payload);

      const newModel = payload.updater(component);
      const newComponent = { ...component, ...newModel } as IConfigurableFormComponent;
      const componentJsonAfter = JSON.stringify(newComponent);
      if (componentJsonBefore === componentJsonAfter) {
        this.log(`FD: no changes detetced in component '${payload.componentId}'`);
        return state;
      }

      const toolboxComponent = this.getToolboxComponent(component.type);

      const newComponents = { ...formFlatMarkup.allComponents, [payload.componentId]: newComponent };
      const componentRelations = { ...formFlatMarkup.componentRelations };

      if (isDefined(toolboxComponent.getContainers)) {
        // update child components

        const oldContainers = toolboxComponent.getContainers(component);
        const newContainers = toolboxComponent.getContainers(newComponent);

        // remove deleted containers
        oldContainers.forEach((oldContainer) => {
          if (!isDefined(newContainers.find((nc) => nc.id === oldContainer.id))) {
            delete newComponents[oldContainer.id];

            delete componentRelations[oldContainer.id];
          }
        });

        // create or update new containers
        newContainers.forEach((c) => {
          const existingContainer = newComponents[c.id] ?? { propertyName: '', type: '', isDynamic: false };
          newComponents[c.id] = { ...existingContainer, ...c };
        });

        // update component child ids
        componentRelations[payload.componentId] = newContainers.map((c) => c.id);
      }

      return {
        ...state,
        formFlatMarkup: {
          allComponents: newComponents,
          componentRelations,
          parents: formFlatMarkup.parents,
        },
      };
    }, `Component ${payload.componentId} updated`);
  };

  getComponentDefinition: FormDesignerComponentGetter = (type: string) => {
    return this.toolboxComponents[type];
  };

  getValidationEnvironment = (): ValidationEnvironment => {
    return {
      deviceType: this.activeDevice,
      theme: this.theme,
      appContext: this.appContext,
    };
  };

  makeComponentValidationContext = (): ComponentValidationContext => {
    const { formSettings } = this.state;
    const env = this.getValidationEnvironment();
    return {
      ...env,
      isSettingsForm: formSettings.isSettingsForm === true,
      formFlatMarkup: this.state.formFlatMarkup,
      path: [],
      scopeProvider: new AmbientScopeProvider<object>(),
      dependencies: NULL_DEPENDENCIES_CONTEXT,
    };
  };

  getComponentDisplayName = (componentId: string): string | ReactNode => {
    if (!this.componentExists(componentId))
      return `unknown component ${componentId}`;

    const component = this.getComponent(componentId);
    const { label, componentName, type } = component;
    return typeof (label) === "string" && !isNullOrWhiteSpace(label)
      ? label
      : !isNullOrWhiteSpace(component.componentName)
        ? componentName
        : `${type} (no name)`;
  };

  validateAllComponentsAsync = async (): Promise<void> => {
    this.log('FD: validateComponentAllComponents');

    this.validationCollector.clear((item) => isNonEmptyArray(item.path) && item.path[0].kind === "component");

    const { formFlatMarkup } = this.state;
    // make root context
    const context = this.makeComponentValidationContext();

    await this.formValidator.validateAllComponentsAsync(formFlatMarkup, context, (component, validationErrors) => {
      this.updateComponentValidationResults(component, validationErrors);
    });
  };

  validateFormSettingsAsync = async (): Promise<void> => {
    const { formSettings } = this.state;
    const validationErrors = await this.formValidator.validateFormSettingsAsync(formSettings, this.formSettingsFormMarkup);

    this.updateValidationResults({
      type: VALIDATABLE_ITEM_TYPES.FORM_SETTINGS,
      validationErrors: validationErrors,
      displayName: "Form settings",
    });
  };

  validateFormAsync = async (): Promise<void> => {
    await this.validateAllComponentsAsync();
    await this.validateFormSettingsAsync();
  };

  validateFormAndSaveResultsAsync = async (): Promise<void> => {
    const id = this.formPersister.formProps?.id;
    if (isNullOrWhiteSpace(id))
      throw new Error('Form has no id');

    const { formFlatMarkup, formSettings } = this.state;
    const env = this.getValidationEnvironment();
    await this.formValidator.validateFormAsync(id, formFlatMarkup, formSettings, env);
  };

  getValidationResults = (): FieldValidationError[] => this.validationCollector.validationResults;

  updateValidationResults = (payload: IValidationResultsPayload): void => {
    const results: FieldValidationError[] = [];
    payload.validationErrors.forEach((err) => {
      if (typeof (err.message) === "object") {
        console.warn('Incorrect data format: object found', err.message);
      }
      const path: ValidationNodeRef[] = err.path ?? [];

      results.push({
        message: err.message,
        severity: 'error',
        path: path,
        propertyName: err.field,
        propertyLabel: err.fieldLabel,
      });
    });

    this.validationCollector.updateValidationResults(payload.type, payload.type === "component" ? payload.componentId : "", payload.displayName, results);
  };

  updateComponentValidationResults = (component: IConfigurableFormComponent, validationErrors: IAsyncValidationError[]): void => {
    this.updateValidationResults({
      type: VALIDATABLE_ITEM_TYPES.COMPONENT,
      componentId: component.id,
      displayName: this.getComponentDisplayName(component.id),
      validationErrors: validationErrors,
    });
  };

  addComponent = (payload: IComponentAddPayload): void => {
    this.updateState((state): FormDesignerFormState => {
      // create component instance
      const { componentType, index, containerId } = payload;

      // access to the list of toolbox  components
      const toolboxComponent = this.getToolboxComponent(componentType);

      const { formFlatMarkup } = state;

      const newFlatMarkup = {
        ...formFlatMarkup,
        allComponents: { ...formFlatMarkup.allComponents },
        componentRelations: { ...formFlatMarkup.componentRelations },
      };
      let newComponents: IConfigurableFormComponent[] = [];
      if (toolboxComponent.isTemplate === true) {
        const builtResult = toolboxComponent.build(this.toolboxComponents);
        newComponents = this.cloneComponents(builtResult);
      } else {
        // create new component
        const componentName = this.generateNewComponentName(newFlatMarkup.allComponents, toolboxComponent);

        let formComponent: IConfigurableFormComponent = {
          id: nanoid(),
          type: toolboxComponent.type,
          propertyName: camelcaseDotNotation(componentName),
          componentName: camelcaseDotNotation(componentName),
          label: componentName,
          labelAlign: 'right',
          parentId: containerId,
          hidden: false,
          isDynamic: false,
        };
        this.log(`FD: addComponent ${formComponent.id} (${formComponent.type})`, payload);
        if (toolboxComponent.initModel) formComponent = toolboxComponent.initModel(formComponent);

        if (toolboxComponent.migrator) {
          formComponent = upgradeComponent(formComponent, toolboxComponent, state.formSettings, {
            allComponents: newFlatMarkup.allComponents,
            componentRelations: newFlatMarkup.componentRelations,
            parents: newFlatMarkup.parents,
          }, true);
        }

        newComponents.push(formComponent);
      }

      const newStructure = this.addComponentToFlatStructure(newFlatMarkup, newComponents, containerId, index);

      this.selectedComponentId = newComponents[0]?.id;

      return {
        ...state,
        formFlatMarkup: newStructure,
      };
    }, `Added component ${payload.componentType}`);
  };

  updateChildComponents = (payload: IUpdateChildComponentsPayload): void => {
    this.log('FD: updateChildComponents', payload);

    this.updateState((state): FormDesignerFormState => {
      const { formFlatMarkup } = state;

      const oldChilds = formFlatMarkup.componentRelations[payload.containerId] ?? [];
      // if not changed - return state as is
      if (idArraysEqual(oldChilds, payload.componentIds)) return state;

      // 2. update parentId in new components list
      const updatedComponents: IComponentsDictionary = {};
      const updatedRelations: IComponentRelations = {
        [payload.containerId]: payload.componentIds,
      };

      payload.componentIds.forEach((id) => {
        const component = this.getComponent(id);
        if (component.parentId !== payload.containerId) {
          // update old parent
          const oldParentKey = !isNullOrWhiteSpace(component.parentId) ? component.parentId : ROOT_COMPONENT_KEY;
          updatedRelations[oldParentKey] = (formFlatMarkup.componentRelations[oldParentKey] ?? []).filter((i) => i !== id);

          // update parent in the current component
          const newComponent: IConfigurableFormComponent = { ...component, parentId: payload.containerId };
          updatedComponents[id] = newComponent;
        }
      });
      const allComponents = { ...formFlatMarkup.allComponents, ...updatedComponents };
      const componentRelations = { ...formFlatMarkup.componentRelations, ...updatedRelations };

      return {
        ...state,
        formFlatMarkup: {
          componentRelations,
          allComponents,
          parents: formFlatMarkup.parents,
        },
      };
    }, `Updated child components ${payload.containerId}`);
  };

  startDraggingNewItem = (): void => {
    this.hasDragged = true;
  };

  endDraggingNewItem = (): void => {
    this.hasDragged = false;
  };

  startDragging = (): void => {
    this.isDragging = true;
    this.hasDragged = true;
  };

  endDragging = (): void => {
    this.isDragging = false;
  };

  setSelectedComponent = (id: string): void => {
    if (this.selectedComponentId === id) return;
    this.selectedComponentId = id;
    this.notifySubscribers(['selection']);
  };

  setDebugMode = (isDebug: boolean): void => {
    if (this.isDebug === isDebug)
      return;
    this.isDebug = isDebug;
    this.notifySubscribers(['readonly']);
  };

  updateFormSettings = (settings: IFormSettings): void => {
    this.updateState((state): FormDesignerFormState => {
      return { ...state, formSettings: settings };
    }, 'Form settings updated');
  };

  addDataProperty = (payload: IAddDataPropertyPayload): void => {
    this.updateState((state): FormDesignerFormState => {
      const { propertyMetadata, index, containerId } = payload;

      const { formFlatMarkup } = state;
      const newFlatMarkup = {
        ...formFlatMarkup,
        allComponents: { ...formFlatMarkup.allComponents },
        componentRelations: { ...formFlatMarkup.componentRelations },
      };
      const formComponent = createComponentModelForDataProperty(this.toolboxComponentGroups, propertyMetadata,
        (fc, tc) => {
          return upgradeComponent(fc, tc, state.formSettings, {
            allComponents: formFlatMarkup.allComponents,
            componentRelations: formFlatMarkup.componentRelations,
            parents: formFlatMarkup.parents,
          }, true);
        },
      );
      if (!isDefined(formComponent)) return state;

      formComponent.parentId = containerId; // set parent
      const newStructure = this.addComponentToFlatStructure(newFlatMarkup, [formComponent], containerId, index);

      this.selectedComponentId = formComponent.id;

      return {
        ...state,
        formFlatMarkup: newStructure,
      };
    }, `Added data property ${payload.propertyMetadata.path}`);
  };

  setReadOnly = (value: boolean): void => {
    if (this.readOnly === value) return;
    this.readOnly = value;
    this.notifySubscribers(['readonly']);
  };

  setActiveDevice = (value: DeviceTypes | undefined): void => {
    if (this.activeDevice === value)
      return;

    this.activeDevice = value;
    void this.validateAllComponentsAsync();
  };

  setFormMode = (value: FormMode): void => {
    if (this.formMode === value) return;
    this.formMode = value;
    this.notifySubscribers(['mode']);
  };

  componentEditors: IComponentSettingsEditorsCache = {};

  getCachedComponentEditor = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(type: string, evaluator: () => ISettingsFormFactory<TModel> | undefined): ISettingsFormFactory<TModel> | undefined => {
    const existingEditor = this.componentEditors[type];
    if (existingEditor !== undefined)
      return existingEditor as unknown as ISettingsFormFactory<TModel>;

    const evaluated = evaluator();
    if (isDefined(evaluated))
      this.componentEditors[type] = evaluated as unknown as ISettingsFormFactory;

    return evaluated;
  };

  private updateState = (updater: (state: FormDesignerFormState) => FormDesignerFormState, description: string): void => {
    if (this.undoableState.executeChange(updater, description)) {
      this.isDataModified = true;
      this.notifySubscribers(['markup', 'selection', 'history', 'data-modified']);

      void this.validateFormAsync();
    }
  };

  undo = (): void => {
    this.log('FD: ◀ undo');
    this.undoableState.undo();
    this.isDataModified = this.undoableState.index > 0;
    this.notifySubscribers(['markup', 'selection', 'history', 'data-modified']);
    void this.validateFormAsync();
  };

  redo = (): void => {
    this.log('FD: ▶ redo');
    this.undoableState.redo();
    this.isDataModified = true;
    this.notifySubscribers(['markup', 'selection', 'history', 'data-modified']);
    void this.validateFormAsync();
  };

  get canUndo(): boolean {
    return this.undoableState.canUndo;
  };

  get canRedo(): boolean {
    return this.undoableState.canRedo;
  };

  get past(): BaseHistoryItem[] {
    return this.undoableState.past;
  }

  get future(): BaseHistoryItem[] {
    return this.undoableState.future;
  }

  get history(): BaseHistoryItem[] {
    return this.undoableState.history;
  }

  get historyIndex(): number {
    return this.undoableState.index;
  }

  private subscriptions: Map<FormDesignerSubscriptionType, Set<FormDesignerSubscription>>;

  private getSubscriptions = (type: FormDesignerSubscriptionType): Set<FormDesignerSubscription> => {
    const existing = this.subscriptions.get(type);
    if (existing)
      return existing;

    const subscriptions = new Set<FormDesignerSubscription>();
    this.subscriptions.set(type, subscriptions);
    return subscriptions;
  };

  subscribe(type: FormDesignerSubscriptionType, callback: FormDesignerSubscription): () => void {
    const callbacks = this.getSubscriptions(type);
    callbacks.add(callback);

    return () => this.unsubscribe(type, callback);
  }

  private unsubscribe(type: FormDesignerSubscriptionType, callback: FormDesignerSubscription): void {
    const callbacks = this.getSubscriptions(type);
    callbacks.delete(callback);
  }

  notifySubscribers(types: FormDesignerSubscriptionType[]): void {
    const allSubscriptions = new Set<FormDesignerSubscription>();
    types.forEach((type) => {
      const subscriptions = this.getSubscriptions(type);
      subscriptions.forEach((s) => allSubscriptions.add(s));
    });

    allSubscriptions.forEach((s) => (s(this)));
  }
};
