import { FormInstance } from 'antd';
import { createContext } from 'react';
import { IFormValidationErrors, IToolboxComponent, IToolboxComponentGroup } from '@/interfaces';
import {
  DEFAULT_FORM_SETTINGS,
  FormAction,
  FormMode,
  FormRawMarkup,
  FormSection,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormAction,
  IFormActions,
  IFormSection,
  IFormSettings,
  ROOT_COMPONENT_KEY,
} from './models';
import { IDataContextFull } from '../dataContextProvider/contexts';

export interface IHasComponentGroups {
  toolboxComponentGroups: IToolboxComponentGroup[];
}

export interface IFormStateInternalContext {
  name?: string;
  formSettings: IFormSettings;
  formMarkup?: FormRawMarkup;
  formMode: FormMode;
  form?: FormInstance<any>;
  actions: IFormAction[];
  sections: IFormSection[];
  context?: any; // todo: make generic

  formContext?: IDataContextFull;

  // runtime props
  formData?: any;
  formControlsData?: any;
  validationErrors?: IFormValidationErrors;
  visibleComponentIds?: string[];
  enabledComponentIds?: string[];

  /**
   * If true, indicates that list of visible components are calculated
   */
  visibleComponentIdsIsSet: boolean;
}

export interface IFormStateContext extends IFormStateInternalContext, IFlatComponentsStructure {}

export interface ISetVisibleComponentsPayload {
  componentIds: string[];
}

export interface ISetEnabledComponentsPayload {
  componentIds: string[];
}

export interface ISetFormControlsDataPayload {
  /** control name */
  name: string;

  /** control values */
  values: any;
}

export interface ISetFormDataPayload {
  /** form field values */
  values: any;

  /** if true, previous data will be merged with current values */
  mergeValues: boolean;
}

export interface IRegisterActionsPayload {
  id: string /** component id */;
  actions: IFormActions /** component actions */;
}

export interface IFormActionsContext {
  setFormMode: (formMode: FormMode) => void;
  getChildComponents: (id: string) => IConfigurableFormComponent[];
  getChildComponentIds: (containerId: string) => string[];
  getComponentModel: (id: string) => IConfigurableFormComponent;
  isComponentReadOnly: (model: Pick<IConfigurableFormComponent, 'id' | 'isDynamic'>) => boolean;
  isComponentHidden: (model: Pick<IConfigurableFormComponent, 'id' | 'isDynamic'>) => boolean;
  hasVisibleChilds: (id: string) => boolean;
  setVisibleComponents: (payload: ISetVisibleComponentsPayload) => void;
  updateStateFormData: (payload: ISetFormDataPayload) => void;
  setFormControlsData: (payload: ISetFormControlsDataPayload) => void;
  setFormData: (payload: ISetFormDataPayload) => void;
  setValidationErrors: (payload: IFormValidationErrors) => void;
  registerActions: (id: string, actions: IFormActions) => void;
  /**
   * Get closest form action by name
   *
   * @param id: id of the current component
   * @param name: name of the action
   */
  getAction: (id: string, name: string) => FormAction;
  getSection: (id: string, name: string) => FormSection;

  getToolboxComponent: (type: string) => IToolboxComponent;

  isComponentFiltered: (component: IConfigurableFormComponent) => boolean;
}

/** Form initial state */
export const FORM_CONTEXT_INITIAL_STATE: IFormStateContext = {
  allComponents: {},
  componentRelations: { [ROOT_COMPONENT_KEY]: [] },

  visibleComponentIds: [],
  visibleComponentIdsIsSet: false,
  enabledComponentIds: [],
  formMode: 'designer',
  actions: [],
  sections: [],
  context: null,
  formSettings: DEFAULT_FORM_SETTINGS,
};

export interface ConfigurableFormInstance extends IFormActionsContext, IFormStateContext {}

export const FormStateContext = createContext<IFormStateContext>(FORM_CONTEXT_INITIAL_STATE);

export const FormActionsContext = createContext<IFormActionsContext>(undefined);
