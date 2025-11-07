import {
  FormMode,
  IComponentRelations,
  IComponentsDictionary,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings,
  IFormValidationErrors,
  isConfigurableFormComponent,
  ISettingsFormFactory,
  IToolboxComponent,
  IToolboxComponentGroup,
  IToolboxComponents,
  ROOT_COMPONENT_KEY,
} from "@/interfaces";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { camelcaseDotNotation } from '@/utils/string';
import { nanoid } from "@/utils/uuid";
import { MutableRefObject } from "react";
import { toolbarGroupsToComponents } from "../form/hooks";
import { createComponentModelForDataProperty, processRecursive, upgradeComponent } from "../form/utils";
import {
  FormDesignerFormState,
  IAddDataPropertyPayload,
  IComponentAddPayload,
  IComponentDeletePayload,
  IComponentDuplicatePayload,
  IComponentUpdatePayload,
  IComponentUpdateSettingsValidationPayload,
  IFormDesignerInstance,
  IUpdateChildComponentsPayload,
} from "./contexts";
import { BaseHistoryItem, FormDesignerSubscription, FormDesignerSubscriptionType, IComponentSettingsEditorsCache } from "./models";
import { IUndoRedoManager, UndoRedoManager } from "./undoRedoManager";

export type FormDesignerArgs = {
  readOnly: boolean;
  toolboxComponentGroups: IToolboxComponentGroup[];
  formFlatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  settingsPanelRef: MutableRefObject<HTMLDivElement | undefined>;
  logEnabled?: boolean;
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

  isDragging: boolean;

  hasDragged: boolean;

  isDebug: boolean;

  readOnly: boolean;

  formMode: FormMode;

  get state(): FormDesignerFormState {
    return this.undoableState.getState();
  }

  constructor(args: FormDesignerArgs) {
    this.toolboxComponentGroups = args.toolboxComponentGroups;
    this.toolboxComponents = toolbarGroupsToComponents(args.toolboxComponentGroups);
    this.settingsPanelRef = args.settingsPanelRef;
    this.readOnly = args.readOnly;
    this.isDebug = false;
    this.formMode = 'designer';
    this.isDragging = false;
    this.hasDragged = false;
    this.subscriptions = new Map<FormDesignerSubscriptionType, Set<FormDesignerSubscription>>();

    // eslint-disable-next-line no-console
    this.log = args.logEnabled ? console.log : () => {};

    const initialState: FormDesignerFormState = {
      formFlatMarkup: args.formFlatMarkup,
      formSettings: args.formSettings,
    };
    this.undoableState = new UndoRedoManager<FormDesignerFormState>(initialState);
  }

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
    this.notifySubscribers(['markup', 'selection', 'history']);
  };

  validationErrors?: IFormValidationErrors | undefined;

  selectedComponentId: string | undefined;

  settingsPanelRef: MutableRefObject<HTMLDivElement | undefined>;

  private getToolboxComponentOrUndefined = (type: string): IToolboxComponent | undefined => {
    return this.toolboxComponents[type];
  };

  private getToolboxComponent = (type: string): IToolboxComponent => {
    const component = this.getToolboxComponentOrUndefined(type);
    if (!isDefined(component))
      throw new Error(`Cannot find toolbox component with type ${type}`);
    return component;
  };

  private getComponent = (id: string): IConfigurableFormComponent => {
    const { formFlatMarkup } = this.state;
    const component = formFlatMarkup.allComponents[id];
    if (!isDefined(component))
      throw new Error(`Cannot find component with id ${id}`);
    return component;
  };

  private cloneComponent = (
    component: IConfigurableFormComponent,
    nestedComponents: IComponentsDictionary,
    nestedRelations: IComponentRelations,
  ): IConfigurableFormComponent => {
    const newId = nanoid();
    const clone: IConfigurableFormComponent = { ...component, id: newId };

    nestedComponents[clone.id] = clone;

    const toolboxComponent = this.getToolboxComponent(component.type);
    const containers = toolboxComponent.customContainerNames ?? [];

    const { formFlatMarkup } = this.state;

    // handle nested components by id of the parent
    const srcNestedComponents = formFlatMarkup.componentRelations[component.id];
    if (srcNestedComponents) {
      const relations: string[] = [];
      nestedRelations[clone.id] = relations;

      srcNestedComponents.forEach((childId) => {
        const child = this.getComponent(childId);
        const childClone = this.cloneComponent(child, nestedComponents, nestedRelations);
        childClone.parentId = clone.id;

        relations.push(childClone.id);
      });
    }

    // handle containers
    containers.forEach((key) => {
      const cntName = key as keyof IConfigurableFormComponent;
      const srcContainer = cntName in component && typeof (component[cntName]) === 'object' && (isConfigurableFormComponent(component[cntName]) || Array.isArray(component[cntName]))
        ? component[cntName]
        : undefined;
      if (srcContainer) {
        // add clone recursively
        const relations: string[] = [];
        nestedRelations[clone.id] = relations;

        const cloneChild = (c: IConfigurableFormComponent): IConfigurableFormComponent => {
          // child may be component or any object with id
          const childClone = this.cloneComponent(c, nestedComponents, nestedRelations);
          if (childClone.hasOwnProperty('parentId')) childClone.parentId = clone.id;

          relations.push(childClone.id);

          return childClone;
        };

        if (isConfigurableFormComponent(srcContainer)) {
          (clone[cntName] as IConfigurableFormComponent) = cloneChild(srcContainer);
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
      if (component.parentId) {
        const parentRelations = [...(componentRelations[component.parentId] ?? [])];
        const childIndex = parentRelations.indexOf(payload.componentId);
        parentRelations.splice(childIndex, 1);

        componentRelations[component.parentId] = parentRelations;
      } else console.warn(`component ${payload.componentId} has no parent`);

      if (this.selectedComponentId === payload.componentId)
        this.selectedComponentId = undefined; // clear selection if we delete current component
      return {
        ...state,
        formFlatMarkup: {
          allComponents,
          componentRelations,
        },
      };
    }, `Removed component ${payload.componentId}`);
  };

  duplicateComponent = (payload: IComponentDuplicatePayload): void => {
    this.log('FD: duplicateComponent', payload);
    this.updateState((state): FormDesignerFormState => {
      const { formFlatMarkup } = state;
      const srcComponent = this.getComponent(payload.componentId);

      const nestedComponents: IComponentsDictionary = {};
      const nestedRelations: IComponentRelations = {};
      const clone = this.cloneComponent(srcComponent, nestedComponents, nestedRelations);

      const parentRelations = srcComponent.parentId
        ? [...(formFlatMarkup.componentRelations[srcComponent.parentId] ?? [])]
        : [];

      const cloneIndex = parentRelations.indexOf(srcComponent.id) + 1;
      parentRelations.splice(cloneIndex, 0, clone.id);

      const componentRelations = {
        ...formFlatMarkup.componentRelations,
        ...(srcComponent.parentId ? { [srcComponent.parentId]: parentRelations } : {}),
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
        },
      };
    }, `Duplicated component ${payload.componentId}`);
  };

  updateComponent = (payload: IComponentUpdatePayload): void => {
    this.log(`FD: updateComponent ${payload.componentId} (${payload.settings.type})`, payload);
    // TODO: review validation from Alex
    // TODO: restore component validation
    this.updateState((state): FormDesignerFormState => {
      const { formFlatMarkup } = state;
      const component = this.getComponent(payload.componentId);
      const newComponent = { ...component, ...payload.settings } as IConfigurableFormComponent;

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
        },
      };
    }, `Component ${payload.componentId} updated`);
    /*
    // ToDo: AS - need to optimize
    if (componentInitialization.current) {
      // Do not trigger an update if first component initialization (reduce unnecessary re-renders)
      componentInitialization.current = false;
      return;
    }

    dispatch(componentUpdateAction(payload));
    const component = flatMarkup.allComponents[payload.componentId];
    if (!isDefined(component))
      return; // TODO: debug validation, component must be defined
    const toolboxComponent = getToolboxComponent(component.type);
    if (!isDefined(toolboxComponent))
      throw new Error('Toolbox component not found');

    const { validateSettings } = toolboxComponent;
    if (isDefined(validateSettings)) {
      validateSettings(payload.settings)
        .then(() => {
          if (isDefined(component.settingsValidationErrors) && component.settingsValidationErrors.length > 0)
            dispatch(componentUpdateSettingsValidationAction({ componentId: payload.componentId, validationErrors: [] }));
        })
        .catch(({ errors }) => {
          const validationErrors = errors as IAsyncValidationError[];
          dispatch(
            componentUpdateSettingsValidationAction({
              componentId: payload.componentId,
              validationErrors,
            }),
          );
        });
    }
    */
  };

  componentUpdateSettingsValidation = (payload: IComponentUpdateSettingsValidationPayload): void => {
    this.log('FD: componentUpdateSettingsValidation', payload);
    this.updateState((state): FormDesignerFormState => {
      const { formFlatMarkup } = state;
      const component = this.getComponent(payload.componentId);
      const newComponent: IConfigurableFormComponent = {
        ...component,
        settingsValidationErrors: payload.validationErrors,
      };

      return {
        ...state,
        formFlatMarkup: {
          ...formFlatMarkup,
          allComponents: { ...formFlatMarkup.allComponents, [payload.componentId]: newComponent },
        },
      };
    }, `Component validated ${payload.componentId}`);
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
      if (toolboxComponent.isTemplate) {
        const allComponents = toolbarGroupsToComponents(this.toolboxComponentGroups);
        const builtResult = toolboxComponent.build(allComponents);
        newComponents = this.cloneComponents(builtResult);
      } else {
        // create new component
        let count = 0;
        for (const key in newFlatMarkup.allComponents) {
          if (newFlatMarkup.allComponents[key]?.type === toolboxComponent.type) count++;
        }
        const componentName = `${toolboxComponent.name}${count + 1}`;

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
    this.selectedComponentId = id;
    this.notifySubscribers(['selection']);
  };

  setValidationErrors = (payload: IFormValidationErrors): void => {
    this.updateState((state): FormDesignerFormState => {
      return { ...state, validationErrors: payload };
    }, 'Validation errors updated');
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
          }, true);
        },
      );
      if (!Boolean(formComponent)) return state;

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

  setFormMode = (value: FormMode): void => {
    if (this.formMode === value) return;
    this.formMode = value;
    this.notifySubscribers(['mode']);
  };

  componentEditors: IComponentSettingsEditorsCache = {};

  getCachedComponentEditor = (type: string, evaluator: () => ISettingsFormFactory): ISettingsFormFactory => {
    const existingEditor = this.componentEditors[type];
    if (existingEditor !== undefined)
      return existingEditor;

    return this.componentEditors[type] = evaluator();
  };

  private updateState = (updater: (state: FormDesignerFormState) => FormDesignerFormState, description: string): void => {
    this.undoableState.executeChange(updater, description);
    this.notifySubscribers(['markup', 'selection', 'history']);
  };

  undo = (): void => {
    this.log('FD: ◀ undo');
    this.undoableState.undo();
    this.notifySubscribers(['markup', 'selection', 'history']);
  };

  redo = (): void => {
    this.log('FD: ▶ redo');
    this.undoableState.redo();
    this.notifySubscribers(['markup', 'selection', 'history']);
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
