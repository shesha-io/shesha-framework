import {
  FieldValidationError,
  IAsyncValidationError,
  IComponentSettingsFormFactory, ISettingsFormFactory,
} from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import {
  FormMarkup,
  FormMode,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings,
} from '../form/models';
import { createNamedContext } from '@/utils/react';
import { BaseHistoryItem, FormDesignerSubscription, FormDesignerSubscriptionType } from './models';
import { IValidationCollector } from '../validator/interfaces';
import { ReactNode } from 'react';
import { DeviceTypes } from '../canvas/contexts';

interface AddComponentPayloadBase {
  index: number;
  containerId: string;
}

export interface IComponentAddPayload extends AddComponentPayloadBase {
  componentType: string;
}

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

export interface IComponentUpdatePayload<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> {
  componentId: string;
  updater: (model: TModel) => TModel;
}

export const VALIDATABLE_ITEM_TYPES = {
  COMPONENT: "component",
  FORM_SETTINGS: "form-settings",
} as const;

export type IValidationResultsPayload = ({ type: typeof VALIDATABLE_ITEM_TYPES.COMPONENT; componentId: string } | { type: typeof VALIDATABLE_ITEM_TYPES.FORM_SETTINGS }) & {
  displayName: string | ReactNode;
  validationErrors: IAsyncValidationError[];
};

export type IUndoable = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  past: BaseHistoryItem[];
  future: BaseHistoryItem[];
  history: BaseHistoryItem[];
  historyIndex: number;
};

export type FormDesignerFormState = {
  formSettings: IFormSettings;
  formFlatMarkup: IFlatComponentsStructure;
};

type FormDesignerState = {
  state: FormDesignerFormState;

  selectedComponentId: string | undefined;
  isDragging: boolean;
  hasDragged: boolean;

  isDataModified: boolean;

  isDebug: boolean;
  readOnly: boolean;
  formMode: FormMode;

  settingsPanelElement: HTMLDivElement | null;
  validationCollector: IValidationCollector;
  formSettingsFormMarkup: FormMarkup;

  isFormSettingsVisible: boolean;
};

type FormDesignerActions = {
  setMarkupAndSettings: (flatMarkup: IFlatComponentsStructure, settings: IFormSettings) => void;

  addComponent: (payload: IComponentAddPayload) => void;
  updateComponent: <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(payload: IComponentUpdatePayload<TModel>) => void;
  deleteComponent: (payload: IComponentDeletePayload) => void;
  deleteSelectedComponent: () => boolean;
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
  setActiveDevice: (value: DeviceTypes | undefined) => void;
  setFormMode: (value: FormMode) => void;

  getCachedComponentEditor: <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(type: string, evaluator: () => ISettingsFormFactory<TModel> | undefined) => (IComponentSettingsFormFactory<TModel> | undefined);

  /** Returns a function that cancels the subscription */
  subscribe: (type: FormDesignerSubscriptionType, callback: FormDesignerSubscription) => () => void;
  loadAsync: () => Promise<void>;
  saveAsync: () => Promise<void>;

  setSettingsPanelElement: (element: HTMLDivElement | null) => void;
  validateFormAsync: () => Promise<void>;
  validateFormAndSaveResultsAsync: () => Promise<void>;
  getValidationResults: () => FieldValidationError[];
  openFormSettings: () => void;
  closeFormSettings: () => void;
};

export type IFormDesignerInstance = FormDesignerActions & IUndoable & FormDesignerState;

export const FormDesignerContext = createNamedContext<IFormDesignerInstance | undefined>(undefined, "FormDesignerContext");
