import { createContext } from 'react';
import { IReferenceList } from '../../interfaces/referenceList';
import { PromisedValue } from '../../utils/promises';
import { ConfigurationItemsViewMode, IComponentSettings } from '../appConfigurator/models';
import { FormFullName, FormIdentifier, IFormDto } from '../form/models';
import { IReferenceListIdentifier } from '../referenceListDispatcher/models';

export interface IConfigurationItemsLoaderStateContext {
  activeProvider?: string;
}

export interface IGetFormPayload {
  formId: FormIdentifier;
  configurationItemMode?: ConfigurationItemsViewMode;
  skipCache: boolean;
}

export interface IGetRefListPayload {
  refListId: IReferenceListIdentifier;
  configurationItemMode?: ConfigurationItemsViewMode;
  skipCache: boolean;
}

export interface IGetComponentPayload {
  name: string;
  isApplicationSpecific: boolean;
  skipCache: boolean;
}
export interface IUpdateComponentPayload {
  name: string;
  module?: string;
  isApplicationSpecific: boolean;
  settings: object;
}

export interface IClearFormCachePayload {
  formId: FormIdentifier;
}

export interface IConfigurationItemsLoaderActionsContext {
  getForm: (payload: IGetFormPayload) => Promise<IFormDto>;
  getRefList: (payload: IGetRefListPayload) => PromisedValue<IReferenceList>;
  getComponent: (payload: IGetComponentPayload) => PromisedValue<IComponentSettings>;
  updateComponent: (payload: IUpdateComponentPayload) => Promise<void>;

  clearFormCache: (payload: IClearFormCachePayload) => void;
  getEntityFormId: (className: string, formType: string, action: (formId: FormFullName) => void) => void;
}

/** initial state */
export const CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE: IConfigurationItemsLoaderStateContext = {
};

export const ConfigurationItemsLoaderStateContext = createContext<IConfigurationItemsLoaderStateContext>(CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE);

export const ConfigurationItemsLoaderActionsContext = createContext<IConfigurationItemsLoaderActionsContext>(undefined);