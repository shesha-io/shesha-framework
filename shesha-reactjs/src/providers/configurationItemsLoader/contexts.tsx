import { PromisedValue } from '@/utils/promises';
import { IComponentSettings } from '../appConfigurator/models';
import { FormFullName, FormIdentifier, IFormDto } from '../form/models';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { createNamedContext } from '@/utils/react';
import { ReferenceListDto } from './models';

export interface IConfigurationItemsLoaderStateContext {
  activeProvider?: string;
}

export interface IGetFormPayload {
  formId: FormIdentifier;
  skipCache: boolean;
}

export interface IGetRefListPayload {
  refListId: IReferenceListIdentifier;
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
  clearFormCache: (payload: IClearFormCachePayload) => void;

  getRefList: (payload: IGetRefListPayload) => PromisedValue<ReferenceListDto>;
  getComponent: (payload: IGetComponentPayload) => PromisedValue<IComponentSettings>;
  updateComponent: (payload: IUpdateComponentPayload) => Promise<void>;
  getEntityFormId: (className: string, formType: string) => Promise<FormFullName>;
}

export const ConfigurationItemsLoaderActionsContext = createNamedContext<IConfigurationItemsLoaderActionsContext | undefined>(undefined, "ConfigurationItemsLoaderActionsContext");

export interface IGetConfigurationPayload {
  module: string;
  name: string;
  itemType: string;
  skipCache: boolean;
};
