import {
  IAsyncValidationError,
  IFormValidationErrors,
  ISettingsFormFactory,
} from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { createNamedContext } from '@/utils/react';
import { MutableRefObject } from 'react';
import { DEFAULT_FORM_SETTINGS, FormMode, IConfigurableFormComponent, IFlatComponentsStructure, IFormSettings, ROOT_COMPONENT_KEY } from "../form/models";

/** Named Data Source */
export interface IDataSource {
  id: string;
  name: string;
  module: string | null;
  containerType: string;
  items: IPropertyMetadata[];
}

export interface IComponentSettingsEditor<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> {
  value: TModel;
  onChange: (value: TModel) => void;
  readOnly: boolean;
}

export type IComponentSettingsEditorsCache = Record<string, ISettingsFormFactory>;

export type RerenderTrigger = () => void;

export type FormDesignerSubscription = (designer: IFormDesignerInstance) => void;
export type FormDesignerSubscriptionType = 'markup' | 'selection' | 'readonly' | 'mode' | 'debug' | 'history' | 'data-modified';

export interface AddComponentPayloadBase {
  index: number;
  containerId: string;
}

export interface IComponentAddPayload extends AddComponentPayloadBase {
  componentType: string;
}

export type IComponentAddFromTemplatePayload = AddComponentPayloadBase;

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
}

export type Undoable = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export type FormDesignerFormState = {
  formSettings: IFormSettings;
  formFlatMarkup: IFlatComponentsStructure;
  validationErrors?: IFormValidationErrors | undefined;
};

export type FormDesignerState = {
  // toolboxComponentGroups: IToolboxComponentGroup[];
  state: FormDesignerFormState;

  selectedComponentId: string | undefined;
  isDragging: boolean;
  hasDragged: boolean;

  isDebug: boolean;
  readOnly: boolean;
  formMode: FormMode;

  settingsPanelRef: MutableRefObject<HTMLDivElement | undefined>;
};

export type FormDesignerActions = {
  setMarkupAndSettings: (flatMarkup: IFlatComponentsStructure, settings: IFormSettings) => void;

  addComponent: (payload: IComponentAddPayload) => void;
  updateComponent: (payload: IComponentUpdatePayload) => void;
  deleteComponent: (payload: IComponentDeletePayload) => void;
  duplicateComponent: (payload: IComponentDuplicatePayload) => void;
  updateChildComponents: (payload: IUpdateChildComponentsPayload) => void;
  addDataProperty: (payload: IAddDataPropertyPayload) => void;

  setValidationErrors: (payload: IFormValidationErrors) => void;

  startDraggingNewItem: () => void;
  endDraggingNewItem: () => void;
  startDragging: () => void;
  endDragging: () => void;

  setSelectedComponent: (id: string) => void;

  setDebugMode: (isDebug: boolean) => void;

  updateFormSettings: (settings: IFormSettings) => void;

  setReadOnly: (value: boolean) => void;
  setFormMode: (value: FormMode) => void;

  getCachedComponentEditor: (type: string, evaluator: () => ISettingsFormFactory) => ISettingsFormFactory;

  subscribe: (type: FormDesignerSubscriptionType, callback: FormDesignerSubscription) => void;
};


export const FORM_INITIAL_STATE: FormDesignerFormState = {
  formSettings: DEFAULT_FORM_SETTINGS,
  formFlatMarkup: {
    allComponents: {},
    componentRelations: { [ROOT_COMPONENT_KEY]: [] },
  },
};

export type IFormDesignerInstance = FormDesignerActions & Undoable & FormDesignerState;

export const FormDesignerContext = createNamedContext<IFormDesignerInstance | undefined>(undefined, "FormDesignerContext");

export type BaseHistoryItem = {
  description: string;
  time: Date;
};
