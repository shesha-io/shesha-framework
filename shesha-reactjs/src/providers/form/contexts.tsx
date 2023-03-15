import { createContext } from 'react';
import { IToolboxComponentGroup, IToolboxComponent, IFormValidationErrors } from '../../interfaces';
import {
  FormMode,
  IConfigurableFormComponent,
  ROOT_COMPONENT_KEY,
  IFormActions,
  IFormAction,
  FormAction,
  FormSection,
  IFormSection,
  IFlatComponentsStructure,
  IFormSettings,
  DEFAULT_FORM_SETTINGS,
  FormRawMarkup,
} from './models';
import { FormInstance } from 'antd';

export interface IHasComponentGroups {
  toolboxComponentGroups: IToolboxComponentGroup[];
}

export interface IFormStateContext extends IFlatComponentsStructure /*IFormProps*/ {
  formSettings: IFormSettings;
  formMarkup?: FormRawMarkup;
  formMode: FormMode;

  form?: FormInstance<any>;
  actions: IFormAction[];
  sections: IFormSection[];
  context?: any; // todo: make generic

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

  /** control actions */
  actions: any;
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
  getComponentModel: (id: string) => IConfigurableFormComponent;
  isComponentDisabled: (model: Pick<IConfigurableFormComponent, 'id' | 'isDynamic' | 'disabled'>) => boolean;
  isComponentHidden: (model: Pick<IConfigurableFormComponent, 'id' | 'isDynamic' | 'hidden'>) => boolean;
  setVisibleComponents: (payload: ISetVisibleComponentsPayload) => void;
  setFormData: (payload: ISetFormDataPayload) => void;
  setFormControlsData: (payload: ISetFormControlsDataPayload) => void;
  setFormDataAndInstance: (payload: ISetFormDataPayload) => void;
  setValidationErrors: (payload: IFormValidationErrors) => void;
  registerActions: (id: string, actions: IFormActions) => void;
  /**
   * Get closest form action by name
   * @param id: id of the current component
   * @param name: name of the action
   */
  getAction: (id: string, name: string) => FormAction;
  getSection: (id: string, name: string) => FormSection;

  getToolboxComponent: (type: string) => IToolboxComponent;
}

/** Form initial state */
export const FORM_CONTEXT_INITIAL_STATE: IFormStateContext = {
  allComponents: {},
  visibleComponentIds: [],
  visibleComponentIdsIsSet: false,
  enabledComponentIds: [],
  componentRelations: { [ROOT_COMPONENT_KEY]: [] },
  formMode: 'designer',
  actions: [],
  sections: [],
  context: null,
  formSettings: DEFAULT_FORM_SETTINGS,
};

export interface ConfigurableFormInstance extends IFormActionsContext, IFormStateContext {}

export const FormStateContext = createContext<IFormStateContext>(FORM_CONTEXT_INITIAL_STATE);

export const FormActionsContext = createContext<IFormActionsContext>(undefined);
