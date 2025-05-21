import { nanoid } from '@/utils/uuid';
import { handleActions } from 'redux-actions';
import { toolbarGroupsToComponents } from 'src/formDesignerUtils';
import { IFormValidationErrors, IToolboxComponentGroup } from '@/interfaces';
import { camelcaseDotNotation } from '@/utils/string';
import undoable from '@/utils/undoable';
import {
  FormMode,
  IComponentRelations,
  IComponentsDictionary,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings,
  ROOT_COMPONENT_KEY,
} from '../form/models';
import {
  cloneComponents,
  createComponentModelForDataProperty,
  findToolboxComponent,
  processRecursive,
  upgradeComponent,
} from '../form/utils';
import { IDataSource } from '../formDesigner/models';
import { FormActionEnums } from './actions';
import {
  FORM_DESIGNER_CONTEXT_INITIAL_STATE,
  IAddDataPropertyPayload,
  IComponentAddPayload,
  IComponentDeletePayload,
  IComponentDuplicatePayload,
  IComponentUpdatePayload,
  IComponentUpdateSettingsValidationPayload,
  IFormDesignerStateContext,
  ISetSelectedComponentPayload,
  IUpdateChildComponentsPayload,
} from './contexts';

const addComponentToFlatStructure = (
  formFlatMarkup: IFlatComponentsStructure,
  toolboxComponentGroups: IToolboxComponentGroup[],
  formComponents: IConfigurableFormComponent[],
  containerId: string,
  index: number
): IFlatComponentsStructure => {
  // build all components dictionary
  const allComponents = { ...formFlatMarkup.allComponents };

  const childRelations: IComponentRelations = {};

  formComponents.forEach((component) => {
    processRecursive(toolboxComponentGroups, containerId, component, (cmp, parentId) => {
      allComponents[cmp.id] = cmp;

      if (parentId !== containerId) {
        const relations = childRelations[parentId] ?? [];
        childRelations[parentId] = [...relations, cmp.id];
      }
    });
  });

  const currentLevel = containerId;

  // add component(s) to the parent container
  const containerComponents = formFlatMarkup.componentRelations[currentLevel]
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

const idArraysEqual = (array1: string[], array2: string[]): boolean => {
  return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
};

const reducer = handleActions<IFormDesignerStateContext, any>(
  {
    [FormActionEnums.SetReadOnly]: (state: IFormDesignerStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return state.readOnly === payload
        ? state
        : {
          ...state,
          readOnly: payload,
        };
    },
    [FormActionEnums.SetFormMode]: (state: IFormDesignerStateContext, action: ReduxActions.Action<FormMode>) => {
      const { payload } = action;

      return state.formMode === payload
        ? state
        : {
          ...state,
          formMode: payload,
        };
    },
    [FormActionEnums.SetFlatComponentsAction]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IFlatComponentsStructure>
    ) => {
      const { payload } = action;

      return {
        ...state,
        formFlatMarkup: payload,
      };
    },

    [FormActionEnums.DataPropertyAdd]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IAddDataPropertyPayload>
    ) => {
      const {
        payload: { propertyMetadata, index, containerId },
      } = action;

      const { formFlatMarkup, toolboxComponentGroups } = state;
      const formComponent = createComponentModelForDataProperty(state.toolboxComponentGroups, propertyMetadata,
        (fc, tc) => {
          return upgradeComponent(fc, tc, state.formSettings, {
            allComponents: formFlatMarkup.allComponents,
            componentRelations: formFlatMarkup.componentRelations,
          }, true);
        }
      );
      if (!Boolean(formComponent)) return state;

      formComponent.parentId = containerId; // set parent
      const newStructure = addComponentToFlatStructure(formFlatMarkup, toolboxComponentGroups, [formComponent], containerId, index);

      return {
        ...state,
        formFlatMarkup: newStructure,
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

      const { formFlatMarkup, toolboxComponentGroups } = state;

      let newComponents: IConfigurableFormComponent[] = [];
      if (toolboxComponent.isTemplate) {
        const allComponents = toolbarGroupsToComponents(state.toolboxComponentGroups);
        newComponents = cloneComponents(state.toolboxComponentGroups, toolboxComponent.build(allComponents));
      } else {
        // create new component
        let count = 0;
        for (const key in formFlatMarkup.allComponents) {
          if (formFlatMarkup.allComponents[key].type === toolboxComponent.type) count++;
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
        if (toolboxComponent.initModel) formComponent = toolboxComponent.initModel(formComponent);
        if (toolboxComponent.migrator) {
          formComponent = upgradeComponent(formComponent, toolboxComponent, state.formSettings, {
            allComponents: formFlatMarkup.allComponents,
            componentRelations: formFlatMarkup.componentRelations,
          }, true);

          // run migrations if available
          // TODO: convert components to clases and run migrations there to check types properly
          /*
          const migrator = new Migrator<IConfigurableFormComponent, IConfigurableFormComponent>();
          const fluent = toolboxComponent.migrator(migrator);
          const model = fluent.migrator.upgrade(formComponent.version ?? -1, formComponent);
          formComponent = model;
          */
        }

        newComponents.push(formComponent);
      }

      const newStructure = addComponentToFlatStructure(formFlatMarkup, toolboxComponentGroups, newComponents, containerId, index);

      return {
        ...state,
        formFlatMarkup: newStructure,
        selectedComponentId: newComponents[0]?.id,
      };
    },

    [FormActionEnums.ComponentDelete]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IComponentDeletePayload>
    ) => {
      const { payload } = action;

      const { formFlatMarkup } = state;
      const { [payload.componentId]: component, ...allComponents } = formFlatMarkup.allComponents;

      // delete self as parent
      const componentRelations = { ...formFlatMarkup.componentRelations };
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
        formFlatMarkup: {
          allComponents,
          componentRelations,
        },
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

        const toolboxComponent = findToolboxComponent(state.toolboxComponentGroups, (c) => c?.type === component.type);
        const containers = toolboxComponent?.customContainerNames ?? [];

        const { formFlatMarkup } = state;

        // handle nested components by id of the parent
        const srcNestedComponents = formFlatMarkup.componentRelations[component.id];
        if (srcNestedComponents) {
          nestedRelations[clone.id] = [];
          const relations = nestedRelations[clone.id];

          srcNestedComponents.forEach((childId) => {
            const child = formFlatMarkup.allComponents[childId];
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
              ? srcContainer.map((c) => cloneChild(c))
              : cloneChild(srcContainer);
          }
        });

        return clone;
      };

      const { formFlatMarkup } = state;
      const srcComponent = formFlatMarkup.allComponents[payload.componentId];

      const nestedComponents: IComponentsDictionary = {};
      const nestedRelations: IComponentRelations = {};
      const clone = cloneComponent(srcComponent, nestedComponents, nestedRelations);

      const parentRelations = [...formFlatMarkup.componentRelations[srcComponent.parentId]];
      const cloneIndex = parentRelations.indexOf(srcComponent.id) + 1;
      parentRelations.splice(cloneIndex, 0, clone.id);

      const componentRelations = {
        ...formFlatMarkup.componentRelations,
        [srcComponent.parentId]: parentRelations,
        ...nestedRelations,
      };
      const allComponents = {
        ...formFlatMarkup.allComponents,
        [clone.id]: clone,
        ...nestedComponents,
      };

      return {
        ...state,
        formFlatMarkup: {
          allComponents,
          componentRelations,
        },
        selectedComponentId: clone.id,
      };
    },

    [FormActionEnums.ComponentUpdate]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IComponentUpdatePayload>
    ) => {
      const { payload } = action;

      const { formFlatMarkup } = state;
      const component = formFlatMarkup.allComponents[payload.componentId];
      const newComponent = { ...component, ...payload.settings } as IConfigurableFormComponent;

      const toolboxComponent = findToolboxComponent(state.toolboxComponentGroups, (c) => c.type === component.type);

      const newComponents = { ...formFlatMarkup.allComponents, [payload.componentId]: newComponent };
      const componentRelations = { ...formFlatMarkup.componentRelations };

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
          const existingContainer = newComponents[c.id] || { propertyName: '', type: '', isDynamic: false };
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

      const { formFlatMarkup } = state;

      const oldChilds = formFlatMarkup.componentRelations[payload.containerId] ?? [];
      // if not changed - return state as is
      if (idArraysEqual(oldChilds, payload.componentIds)) return state;

      // 2. update parentId in new components list
      const updatedComponents = {};
      const updatedRelations: { [index: string]: string[] } = {
        [payload.containerId]: payload.componentIds,
      };

      payload.componentIds.forEach((id) => {
        const component = formFlatMarkup.allComponents[id];
        if (component.parentId !== payload.containerId) {
          // update old parent
          const oldParentKey = component.parentId || ROOT_COMPONENT_KEY;
          updatedRelations[oldParentKey] = formFlatMarkup.componentRelations[oldParentKey].filter((i) => i !== id);

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
      };
    },

    [FormActionEnums.SetPreviousSelectedComponent]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<ISetSelectedComponentPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        previousSelectedComponentId: payload.id,
        previousSelectedComponentRef: payload.componentRef,
      };
    },
    
    [FormActionEnums.ChangeMarkup]: (
      state: IFormDesignerStateContext,
      action: ReduxActions.Action<IFlatComponentsStructure>
    ) => {
      const { payload } = action;

      return {
        ...state,
        formFlatMarkup: payload,
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

      const { formFlatMarkup } = state;
      const component = formFlatMarkup.allComponents[payload.componentId];
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
  includeAction: (action) => undoableActions.indexOf(action) > -1,
  limit: 20, // set a limit for the size of the history
});

export default undoableReducer;
