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
import type { FormDesignerComponentGetter } from '../form/hooks';
import type { IContainerOwnership } from './structure/containers';
import type { INameChange, IPasteSelection, PasteMode } from './clipboard';

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

export interface IComponentMovePayload {
  componentId: string;
  /** ROOT_COMPONENT_KEY, a component's own container (its id), or a pane (tab, step, column...) */
  containerId: string;
  /** Final position in the target list, counted after the component has been taken out of its current place */
  index: number;
}

export type ChangeResult = { ok: true } | { ok: false; reason: string };

export interface IComponentsPastePayload {
  /** Components in saved-form (tree) format, e.g. from the clipboard. They're changed while pasting */
  components: IConfigurableFormComponent[];
  selection: IPasteSelection;
  mode: PasteMode;
}

export type PasteResult = { ok: true; componentIds: string[]; renamed: INameChange[] } | { ok: false; reason: string };

export interface IComponentSettingsPastePayload {
  componentId: string;
  /** Type of the component the settings were copied from */
  componentType: string;
  settings: Record<string, unknown>;
}

export interface IRevealRequest {
  /** Panes to open, outermost first */
  containerIds: readonly string[];
  /** Panes already opened for this request, so a component that mounts again doesn't re-open them */
  opened: Set<string>;
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

  /** Increases by one whenever any container's list of children changes (add, delete, move, undo...), but not on property edits */
  structureVersion: number;

  /** The latest request to open panes on the canvas (see reveal) */
  revealRequest: IRevealRequest;
};

type FormDesignerActions = {
  setMarkupAndSettings: (flatMarkup: IFlatComponentsStructure, settings: IFormSettings) => void;

  addComponent: (payload: IComponentAddPayload) => void;
  updateComponent: <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(payload: IComponentUpdatePayload<TModel>) => void;
  deleteComponent: (payload: IComponentDeletePayload) => void;
  deleteSelectedComponent: () => boolean;
  duplicateComponent: (payload: IComponentDuplicatePayload) => void;
  updateChildComponents: (payload: IUpdateChildComponentsPayload) => void;
  /** Moves a component to a container and position as one undo step. Never throws for invalid moves */
  moveComponent: (payload: IComponentMovePayload) => ChangeResult;
  /** The component with everything inside it, in saved-form format */
  getComponentTree: (componentId: string) => IConfigurableFormComponent | undefined;
  /** Pastes components with new ids where `selection` and `mode` say, as one undo step */
  pasteComponents: (payload: IComponentsPastePayload) => PasteResult;
  /** Applies copied settings to a component of the same type, keeping its identity, binding and contents. One undo step */
  pasteSettings: (payload: IComponentSettingsPastePayload) => ChangeResult;
  getComponentDefinition: FormDesignerComponentGetter;
  /** Which component owns each container, rebuilt only when the structure changes */
  getContainerOwnership: () => IContainerOwnership;
  /** Asks Tabs, Wizard and Collapsible Panel to open the panes needed to show a component (or pane) on the canvas */
  reveal: (id: string) => void;
  /** Called by canvas components while they're drawn; returns the function to call when they go away */
  registerMountedComponent: (id: string) => () => void;
  isComponentMounted: (id: string) => boolean;
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
