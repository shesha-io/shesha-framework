import { IConfigurableActionDescriptor } from '@/interfaces/configurableAction';
import { IGetConfigurableActionPayload } from './contexts';
import { ActionParametersDictionary } from '../..';

export interface IConfigurableActionDictionary {
  [key: string]: IConfigurableActionDescriptor[];
}

export interface IConfigurableActionGroup {
  ownerName: string;
  actions: IConfigurableActionDescriptor[];
}
export interface IConfigurableActionGroupDictionary {
  [key: string]: IConfigurableActionGroup;
}

export type ConfigurableActionGetter = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;
export type IGetContextualConfigurableActionPayload = IGetConfigurableActionPayload & {
  componentId: string;
};
export type ContextConfigurableActionGetter = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetContextualConfigurableActionPayload) => IConfigurableActionDescriptor<TArguments> | null;

export enum SheshaActionOwners {
  ConfigurationFramework = 'shesha.configurationFramework',
  Common = 'shesha.common',
  Form = 'shesha.form',
}

export const CA_LABELS = {
  HANDLE_SUCCESS: 'Handle Success',
  ON_SUCCESS_HANDLER: 'On Success Handler',
  HANDLE_FAIL: 'Handle Fail',
  ON_FAIL_HANDLER: 'On Fail Handler',
};
