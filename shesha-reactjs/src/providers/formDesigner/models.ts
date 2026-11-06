import {
  IFormValidationErrors,
  ISettingsFormFactory,
} from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { FormMode, IFlatComponentsStructure, IFormSettings } from "../form/models";
import { IComponentUpdatePayload } from './contexts';

/** Named Data Source */
export interface IDataSource {
  id: string;
  name: string;
  module: string | null;
  containerType: string;
  items: IPropertyMetadata[];
}

export type IComponentSettingsEditorsCache = Record<string, ISettingsFormFactory>;

export type FormDesignerSubscription = (designer: IFormDesignerInstance) => void;
export type FormDesignerSubscriptionType = 'markup' | 'selection' | 'readonly' | 'mode' | 'debug' | 'history' | 'data-modified' | 'settings-tab' | 'settings' | 'structure' | 'reveal' | 'mounted';

interface AddComponentPayloadBase {
  index: number;
  containerId: string;
}

interface IComponentAddPayload extends AddComponentPayloadBase {
  componentType: string;
}

interface IAddDataPropertyPayload {
  propertyMetadata: IPropertyMetadata;
  index: number;
  containerId: string;
}

interface IUpdateChildComponentsPayload {
  containerId: string;
  componentIds: string[];
}

interface IComponentDeletePayload {
  componentId: string;
}

interface IComponentDuplicatePayload {
  componentId: string;
}

type Undoable = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

type FormDesignerFormState = {
  formSettings: IFormSettings;
  formFlatMarkup: IFlatComponentsStructure;
  validationErrors?: IFormValidationErrors | undefined;
};

type FormDesignerState = {
  // toolboxComponentGroups: IToolboxComponentGroup[];
  state: FormDesignerFormState;

  selectedComponentId: string | undefined;
  isDragging: boolean;
  hasDragged: boolean;

  isDebug: boolean;
  readOnly: boolean;
  formMode: FormMode;

  settingsPanelElement: HTMLDivElement | null;
};

type FormDesignerActions = {
  setMarkupAndSettings: (flatMarkup: IFlatComponentsStructure, settings: IFormSettings) => void;

  addComponent: (payload: IComponentAddPayload) => void;
  updateComponent: (payload: IComponentUpdatePayload) => void;
  deleteComponent: (payload: IComponentDeletePayload) => void;
  duplicateComponent: (payload: IComponentDuplicatePayload) => void;
  updateChildComponents: (payload: IUpdateChildComponentsPayload) => void;
  addDataProperty: (payload: IAddDataPropertyPayload) => void;

  startDraggingNewItem: () => void;
  endDraggingNewItem: () => void;
  startDragging: () => void;
  endDragging: () => void;

  setSelectedComponent: (id: string) => void;

  setDebugMode: (isDebug: boolean) => void;

  updateFormSettings: (settings: IFormSettings) => void;

  setReadOnly: (value: boolean) => void;
  setFormMode: (value: FormMode) => void;

  getCachedComponentEditor: (type: string, evaluator: () => ISettingsFormFactory) => ISettingsFormFactory | undefined;

  /** Returns a function that cancels the subscription */
  subscribe: (type: FormDesignerSubscriptionType, callback: FormDesignerSubscription) => () => void;

  setSettingsPanelElement: (element: HTMLDivElement | null) => void;
};

type IFormDesignerInstance = FormDesignerActions & Undoable & FormDesignerState;

export type BaseHistoryItem = {
  description: string;
  time: Date;
};

type IssueSeverity = 'warning' | 'error';
export type ConfigurationIssue = {
  severity: IssueSeverity;
  location: string;
  property: string;
  message: string;
  code?: string | undefined;
};
