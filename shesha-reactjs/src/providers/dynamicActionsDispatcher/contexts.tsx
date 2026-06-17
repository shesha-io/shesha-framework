import { IProvidersDictionary } from './models';
import { IDynamicActionsContext, IDynamicActionsContextBase } from '../dynamicActions/contexts';
import { createNamedContext } from '@/utils/react';

export interface IRegisterProviderPayload<TSettings extends object = object> {
  id: string;
  contextValue: IDynamicActionsContext<TSettings>;
}

export interface IDynamicActionsDispatcher {
  registerProvider: <TSettings extends object = object>(payload: IRegisterProviderPayload<TSettings>) => void;
  getProviders: () => IProvidersDictionary;
  getProvider: (providerUid: string) => IDynamicActionsContext | undefined;
}

export interface IDynamicActionsRegistration {
  id: string;
  contextValue: IDynamicActionsContextBase;
}

export const DynamicActionsDispatcherContext = createNamedContext<IDynamicActionsDispatcher | undefined>(undefined, "DynamicActionsDispatcherContext");
