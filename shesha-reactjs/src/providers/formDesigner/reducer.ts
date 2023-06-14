import {
  FORM_DESIGNER_CONTEXT_INITIAL_STATE,
  IFormDesignerStateContext,
  IComponentAddPayload,
  IComponentDeletePayload,
  IComponentUpdatePayload,
  IUpdateChildComponentsPayload,
  ISetSelectedComponentPayload,
  IComponentUpdateSettingsValidationPayload,
  IAddDataPropertyPayload,
  IHasComponentGroups,
  IComponentDuplicatePayload,
} from './contexts';
import {
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IComponentRelations,
  IFormSettings,
  IComponentsDictionary,
  ROOT_COMPONENT_KEY,
} from '../form/models';
import { FormActionEnums } from './actions';
import { handleActions } from 'redux-actions';
import {
  cloneComponents,
  createComponentModelForDataProperty,
  findToolboxComponent,
  getCustomEnabledFunc,
  getCustomVisibilityFunc,
  processRecursive,
  upgradeComponent,
} from '../form/utils';
import { camelcaseDotNotation } from '../../utils/string';
import { IFormValidationErrors, IToolboxComponentGroup } from '../../interfaces';
import { IDataSource } from '../formDesigner/models';
import { nanoid } from 'nanoid/non-secure';
import undoable from 'utils/undoable';

const addComponentToFlatStructure = (
  structure: IFlatComponentsStructure & IHasComponentGroups,
  formComponents: IConfigurableFormComponent[],
  containerId: string,
  index: number
): IFlatComponentsStructure => {
  // build all components dictionary
  const allComponents = { ...structure.allComponents };

  const childRelations: IComponentRelations = {};

  formComponents.forEach((component) => {
    processRecursive(structure.toolboxComponentGroups, containerId, component, (cmp, parentId) => {
      allComponents[cmp.id] = cmp;

      if (parentId !== containerId) {
        const relations = childRelations[parentId] ?? [];
        childRelations[parentId] = [...relations, cmp.id];
      }
    });
  });

  const currentLevel = containerId;

  // add component(s) to the parent container
  const containerComponents = structure.componentRelations[currentLevel]
    ? [...structure.componentRelations[currentLevel]]
    : [];
  formComponents.forEach((component) => {
    containerComponents.splice(index, 0, component.id);
  });
  const componentRelations = {
    ...structure.componentRelations,
    [currentLevel]: containerComponents,
    ...childRelations,
  };

  return {
    allComponents,
    componentRelations,
  };
};

const idArraysEqual = (array1: string[], array2: string[]): boolean => {
  return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
};

const reducer = handleActions<IFormDesignerStateContext, any>(
  {
    [FormActionEnums.SetReadOnly]: (state: IFormDesignerStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        readOnly: payload,
      };
    },
    [FormActionEnums.SetFlatComponentsAction]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IFlatComponentsStructure>
    ) => {
      const { payload } = action;

      return {
        ...state,
        allComponents: payload.allComponents,
        componentRelations: payload.componentRelations,
      };
    },

    [FormActionEnums.DataPropertyAdd]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IAddDataPropertyPayload>
    ) => {
      const {
        payload: { propertyMetadata, index, containerId },
      } = action;

      const formComponent = createComponentModelForDataProperty(state.toolboxComponentGroups, propertyMetadata);
      if (!Boolean(formComponent)) return state;

      formComponent.parentId = containerId; // set parent
      const newStructure = addComponentToFlatStructure(state, [formComponent], containerId, index);

      return {
        ...state,
        allComponents: newStructure.allComponents,
        componentRelations: newStructure.componentRelations,
        selectedComponentId: formComponent.id,
      };
    },
    [FormActionEnums.ComponentAdd]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IComponentAddPayload>
    ) => {
      const { payload } = action;

      // create component instance
      const { componentType, index, containerId } = payload;

      // access to the list of toolbox  components
      const toolboxComponent = findToolboxComponent(state.toolboxComponentGroups, (c) => c.type === componentType);

      if (!toolboxComponent) return state;

      let newComponents: IConfigurableFormComponent[] = [];
      if (toolboxComponent.isTemplate) {
        newComponents = cloneComponents(state.toolboxComponentGroups, toolboxComponent.build());
      } else {
        // create new component
        let count = 0;
        for (const key in state.allComponents) {
          if (state.allComponents[key].type === toolboxComponent.type) count++;
        }
        const componentName = `${toolboxComponent.name}${count + 1}`;

        let formComponent: IConfigurableFormComponent = {
          id: nanoid(),
          type: toolboxComponent.type,
          name: camelcaseDotNotation(componentName),
          label: componentName,
          labelAlign: 'right',
          parentId: containerId,
          hidden: false,
          visibility: 'Yes',
          customVisibility: null,
          visibilityFunc: (_data) => true,
          enabledFunc: (_data) => true,
          isDynamic: false,
        };
        if (toolboxComponent.initModel) formComponent = toolboxComponent.initModel(formComponent);
        if (toolboxComponent.migrator) {
          formComponent = upgradeComponent(formComponent, toolboxComponent, state.formSettings, {
            allComponents: state.allComponents,
            componentRelations: state.componentRelations,
          });

          // run migrations if available
          // todo: convert components to clases and run migrations there to check types properly
          /*
          const migrator = new Migrator<IConfigurableFormComponent, IConfigurableFormComponent>();
          const fluent = toolboxComponent.migrator(migrator);
          const model = fluent.migrator.upgrade(formComponent.version ?? -1, formComponent);
          formComponent = model;
          */
        }

        newComponents.push(formComponent);
      }

      const newStructure = addComponentToFlatStructure(state, newComponents, containerId, index);

      return {
        ...state,
        allComponents: newStructure.allComponents,
        componentRelations: newStructure.componentRelations,
        selectedComponentId: newComponents[0]?.id,
      };
    },

    [FormActionEnums.ComponentDelete]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IComponentDeletePayload>
    ) => {
      const { payload } = action;

      const { [payload.componentId]: component, ...allComponents } = state.allComponents;

      // delete self as parent
      const componentRelations = { ...state.componentRelations };
      delete componentRelations[payload.componentId];

      // delete self as child
      if (component.parentId) {
        const parentRelations = [...componentRelations[component.parentId]];
        const childIndex = parentRelations.indexOf(payload.componentId);
        parentRelations.splice(childIndex, 1);

        componentRelations[component.parentId] = parentRelations;
      } else console.warn(`component ${payload.componentId} has no parent`);

      return {
        ...state,
        allComponents,
        componentRelations,
        selectedComponentId: state.selectedComponentId === payload.componentId ? null : state.selectedComponentId, // clear selection if we delete current component
      };
    },

    [FormActionEnums.ComponentDuplicate]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IComponentDuplicatePayload>
    ) => {
      const { payload } = action;

      const cloneComponent = (
        component: IConfigurableFormComponent,
        nestedComponents: IComponentsDictionary,
        nestedRelations: IComponentRelations
      ): IConfigurableFormComponent => {
        const newId = nanoid();
        const clone = { ...component, id: newId };

        nestedComponents[clone.id] = clone;

        const toolboxComponent = findToolboxComponent(state.toolboxComponentGroups, (c) => c.type === component.type);
        const containers = toolboxComponent?.customContainerNames ?? [];

        // handle nested components by id of the parent
        const srcNestedComponents = state.componentRelations[component.id];
        if (srcNestedComponents) {

          nestedRelations[clone.id] = [];
          const relations = nestedRelations[clone.id];

          srcNestedComponents.forEach((childId) => {
            const child = state.allComponents[childId];
            const childClone = cloneComponent(child, nestedComponents, nestedRelations);
            childClone.parentId = clone.id;

            relations.push(childClone.id);
          });
        }

        // handle containers
        containers.forEach((cntName) => {
          const srcContainer = component[cntName];
          if (srcContainer) {
            // add clone recursively
            nestedRelations[clone.id] = [];
            const relations = nestedRelations[clone.id];

            const cloneChild = (c) => {
              // child may be component or any object with id
              const childClone = cloneComponent(c, nestedComponents, nestedRelations);
              if (childClone.hasOwnProperty('parentId')) childClone.parentId = clone.id;

              relations.push(childClone.id);

              return childClone;
            };

            clone[cntName] = Array.isArray(srcContainer)
              ? srcContainer.map(c => cloneChild(c))
              : cloneChild(srcContainer);
          }
        });

        return clone;
      };

      const srcComponent = state.allComponents[payload.componentId];

      const nestedComponents: IComponentsDictionary = {};
      const nestedRelations: IComponentRelations = {};
      const clone = cloneComponent(srcComponent, nestedComponents, nestedRelations);

      const parentRelations = [...state.componentRelations[srcComponent.parentId]];
      const cloneIndex = parentRelations.indexOf(srcComponent.id) + 1;
      parentRelations.splice(cloneIndex, 0, clone.id);

      const componentRelations = {
        ...state.componentRelations,
        [srcComponent.parentId]: parentRelations,
        ...nestedRelations,
      };
      const allComponents = {
        ...state.allComponents,
        [clone.id]: clone,
        ...nestedComponents,
      };

      return {
        ...state,
        allComponents,
        componentRelations,
        selectedComponentId: clone.id,
      };
    },

    [FormActionEnums.ComponentUpdate]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IComponentUpdatePayload>
    ) => {
      const { payload } = action;

      const component = state.allComponents[payload.componentId];
      const newComponent = { ...component, ...payload.settings } as IConfigurableFormComponent;
      newComponent.visibilityFunc = getCustomVisibilityFunc(newComponent);
      newComponent.enabledFunc = getCustomEnabledFunc(newComponent);

      const toolboxComponent = findToolboxComponent(state.toolboxComponentGroups, (c) => c.type === component.type);

      const newComponents = { ...state.allComponents, [payload.componentId]: newComponent };
      const componentRelations = { ...state.componentRelations };

      if (toolboxComponent.getContainers) {
        // update child components

        const oldContainers = toolboxComponent.getContainers(component);
        const newContainers = toolboxComponent.getContainers(newComponent);

        // remove deleted containers
        oldContainers.forEach((oldContainer) => {
          if (!newContainers.find((nc) => nc.id === oldContainer.id)) {
            delete newComponents[oldContainer.id];

            delete componentRelations[oldContainer.id];
          }
        });

        // create or update new containers
        newContainers.forEach((c) => {
          const existingContainer = newComponents[c.id] || { name: '', type: '', isDynamic: false };
          newComponents[c.id] = { ...existingContainer, ...c };
        });

        // update component child ids
        componentRelations[payload.componentId] = newContainers.map((c) => c.id);
      }

      return {
        ...state,
        allComponents: newComponents,
        componentRelations,
      };
    },

    [FormActionEnums.SetDebugMode]: (state: IFormDesignerStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        isDebug: payload,
      };
    },

    [FormActionEnums.StartDraggingNewItem]: (state: IFormDesignerStateContext) => {
      return {
        ...state,
        hasDragged: true,
      };
    },
    [FormActionEnums.EndDraggingNewItem]: (state: IFormDesignerStateContext) => {
      return {
        ...state,
      };
    },

    [FormActionEnums.StartDragging]: (state: IFormDesignerStateContext) => {
      return {
        ...state,
        isDragging: true,
        hasDragged: true,
      };
    },
    [FormActionEnums.EndDragging]: (state: IFormDesignerStateContext) => {
      return {
        ...state,
        isDragging: false,
      };
    },

    [FormActionEnums.SetValidationErrors]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IFormValidationErrors>
    ) => {
      const { payload } = action;

      return {
        ...state,
        validationErrors: payload ? { ...payload } : null,
      };
    },

    [FormActionEnums.UpdateChildComponents]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IUpdateChildComponentsPayload>
    ) => {
      const { payload } = action;

      const oldChilds = state.componentRelations[payload.containerId] ?? [];
      // if not changed - return state as is
      if (idArraysEqual(oldChilds, payload.componentIds)) return state;

      // 2. update parentId in new components list
      const updatedComponents = {};
      const updatedRelations: { [index: string]: string[] } = {
        [payload.containerId]: payload.componentIds,
      };

      payload.componentIds.forEach((id) => {
        const component = state.allComponents[id];
        if (component.parentId !== payload.containerId) {
          // update old parent
          const oldParentKey = component.parentId || ROOT_COMPONENT_KEY;
          updatedRelations[oldParentKey] = state.componentRelations[oldParentKey].filter((i) => i !== id);

          // update parent in the current component
          const newComponent: IConfigurableFormComponent = { ...component, parentId: payload.containerId };
          updatedComponents[id] = newComponent;
        }
      });
      const allComponents = { ...state.allComponents, ...updatedComponents };
      const componentRelations = { ...state.componentRelations, ...updatedRelations };

      return {
        ...state,
        componentRelations,
        allComponents,
      };
    },

    [FormActionEnums.SetSelectedComponent]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<ISetSelectedComponentPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedComponentId: payload.id,
        selectedComponentRef: payload.componentRef,
        activeDataSourceId: payload.dataSourceId,
      };
    },

    [FormActionEnums.ChangeMarkup]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IFlatComponentsStructure>
    ) => {
      const { payload } = action;

      return {
        ...state,
        allComponents: payload.allComponents,
        componentRelations: payload.componentRelations,
      };
    },

    [FormActionEnums.UpdateFormSettings]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IFormSettings>
    ) => {
      const { payload } = action;

      return {
        ...state,
        formSettings: payload,
      };
    },

    [FormActionEnums.ComponentUpdateSettingsValidation]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IComponentUpdateSettingsValidationPayload>
    ) => {
      const { payload } = action;

      const component = state.allComponents[payload.componentId];
      const newComponent: IConfigurableFormComponent = {
        ...component,
        settingsValidationErrors: payload.validationErrors,
      };

      return {
        ...state,
        allComponents: { ...state.allComponents, [payload.componentId]: newComponent },
      };
    },

    [FormActionEnums.AddDataSource]: (state: IFormDesignerStateContext, action: ReduxActions.Action<IDataSource>) => {
      const { payload } = action;

      return {
        ...state,
        dataSources: [...state.dataSources, payload],
      };
    },

    [FormActionEnums.RemoveDataSource]: (state: IFormDesignerStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      const newDataSources = state.dataSources.filter((ds) => ds.id !== payload);

      return {
        ...state,
        dataSources: [...newDataSources],
      };
    },

    [FormActionEnums.UpdateToolboxComponentGroups]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IToolboxComponentGroup[]>
    ) => {
      const { payload } = action;

      return {
        ...state,
        toolboxComponentGroups: payload,
      };
    },
  },

  FORM_DESIGNER_CONTEXT_INITIAL_STATE
);

const undoableActions: string[] = [
  FormActionEnums.DataPropertyAdd,
  FormActionEnums.ComponentAdd,
  FormActionEnums.ComponentDelete,
  FormActionEnums.ComponentUpdate,
  FormActionEnums.EndDragging,
];
const undoableReducer = undoable(reducer, {
  includeAction: action => (undoableActions.indexOf(action) > -1),
  limit: 20, // set a limit for the size of the history
});

export default undoableReducer;