import { MutableRefObject } from 'react';
import {
  IAsyncValidationError,
  IFormValidationErrors,
  ISettingsFormFactory,
  IToolboxComponent,
  IToolboxComponentGroup,
} from '@/interfaces';

import { IPropertyMetadata } from '@/interfaces/metadata';
import { StateWithHistory } from '@/utils/undoable';
import {
  DEFAULT_FORM_SETTINGS,
  FormMode,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings,
  ROOT_COMPONENT_KEY,
} from '../form/models';
import { IDataSource } from '../formDesigner/models';
import { createNamedContext } from '@/utils/react';
import { createContext } from 'use-context-selector';

export interface IFormDesignerStateContext {
  toolboxComponentGroups: IToolboxComponentGroup[];
  validationErrors?: IFormValidationErrors;

  selectedComponentId?: string;
  selectedComponentRef?: MutableRefObject<any>;
  isDragging: boolean;
  hasDragged: boolean;
  dataSources: IDataSource[];

  isDebug: boolean;
  readOnly: boolean;
  formMode: FormMode;

  settingsPanelRef?: MutableRefObject<any>;

  // TODO: move to persister
  formSettings: IFormSettings;
  formFlatMarkup: IFlatComponentsStructure;
}

export interface IUndoableFormDesignerStateContext extends StateWithHistory<IFormDesignerStateContext> { }

export interface AddComponentPayloadBase {
  index: number;
  containerId: string;
}

export interface IComponentAddPayload extends AddComponentPayloadBase {
  componentType: string;
}

export interface IComponentAddFromTemplatePayload extends AddComponentPayloadBase { }

export interface IAddDataPropertyPayload {
  propertyMetadata: IPropertyMetadata;
  index: number;
  containerId: string;
}

export interface IUpdateChildComponentsPayload {
  containerId: string;
  componentIds: string[];
}

export interface IComponentDeletePayload {
  componentId: string;
}

export interface IComponentDuplicatePayload {
  componentId: string;
}

export interface IComponentUpdatePayload {
  componentId: string;
  settings: IConfigurableFormComponent;
}

export interface IComponentUpdateSettingsValidationPayload {
  componentId: string;
  validationErrors: IAsyncValidationError[];
}

export interface ISetSelectedComponentPayload {
  id: string;
  componentRef?: MutableRefObject<any>;
}

export interface IFormDesignerActionsContext {
  deleteComponent: (payload: IComponentDeletePayload) => void;
  duplicateComponent: (payload: IComponentDuplicatePayload) => void;
  updateComponent: (payload: IComponentUpdatePayload) => void;
  addComponent: (payload: IComponentAddPayload) => void;
  addComponentsFromTemplate: (payload: IComponentAddFromTemplatePayload) => void;
  updateChildComponents: (payload: IUpdateChildComponentsPayload) => void;
  startDraggingNewItem: () => void;
  endDraggingNewItem: () => void;
  startDragging: () => void;
  endDragging: () => void;

  setSelectedComponent: (id: string, componentRef?: MutableRefObject<any>) => void;

  setValidationErrors: (payload: IFormValidationErrors) => void;

  setDebugMode: (isDebug: boolean) => void;

  updateFormSettings: (settings: IFormSettings) => void;

  getToolboxComponent: (type: string) => IToolboxComponent;

  addDataProperty: (payload: IAddDataPropertyPayload) => void;
  addDataSource: (dataSource: IDataSource) => void;
  removeDataSource: (id: string) => void;
  setActiveDataSource: (id: string) => void;

  setReadOnly: (value: boolean) => void;
  setFormMode: (value: FormMode) => void;

  getCachedComponentEditor: (type: string, evaluator: () => ISettingsFormFactory) => ISettingsFormFactory;

  undo: () => void;
  redo: () => void;
}

/** Form initial state */
export const FORM_DESIGNER_CONTEXT_INITIAL_STATE: IFormDesignerStateContext = {
  hasDragged: false,
  isDragging: false,
  isDebug: false,
  formSettings: DEFAULT_FORM_SETTINGS,
  formFlatMarkup: {
    allComponents: {},
    componentRelations: { [ROOT_COMPONENT_KEY]: [] },
  },
  toolboxComponentGroups: [],
  dataSources: [],
  readOnly: true,
  formMode: 'designer',
};

export const UndoableFormDesignerStateContext = createNamedContext<IUndoableFormDesignerStateContext>({
  past: [],
  present: FORM_DESIGNER_CONTEXT_INITIAL_STATE,
  future: [],
}, "UndoableFormDesignerStateContext");

export interface ConfigurableFormInstance extends IFormDesignerActionsContext, IFormDesignerStateContext { }

//export const FormDesignerStateContext = createNamedContext<IFormDesignerStateContext>(FORM_DESIGNER_CONTEXT_INITIAL_STATE, "FormDesignerStateContext");
export const FormDesignerStateContext = createContext<IFormDesignerStateContext>(FORM_DESIGNER_CONTEXT_INITIAL_STATE);

export const FormDesignerActionsContext = createNamedContext<IFormDesignerActionsContext>(undefined, "FormDesignerActionsContext");