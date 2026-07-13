import { Context } from 'react';
import {
  IConfigurableComponentActionsContext,
  IConfigurableComponentStateContext,
} from './contexts';
import { ComponentSettingsMigrator } from '@/components/configurableComponent/index';


export interface IGenericConfigurableComponentProviderProps<TSettings extends object = object> {
  initialState: IConfigurableComponentStateContext<TSettings>;
  stateContext: Context<IConfigurableComponentStateContext<TSettings>>;
  actionContext: Context<IConfigurableComponentActionsContext<TSettings>>;
  name: string;
  isApplicationSpecific: boolean;
  migrator?: ComponentSettingsMigrator<TSettings>;
}

export interface IConfigurableComponentProviderProps {
  name: string;
  isApplicationSpecific: boolean;
}
