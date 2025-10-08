import { IFlagsSetters, IFlagsState } from '@/interfaces';
import { IConfigurableComponentProps } from './models';
import { createNamedContext } from '@/utils/react';
import { Context } from 'react';

export type IFlagProgressFlags = 'load' | 'save';
export type IFlagSucceededFlags = 'load' | 'save';
export type IFlagErrorFlags = 'load' | 'save';
export type IFlagActionedFlags = '__DEFAULT__';

export interface ILayoutProps {
  span: number;
}

export interface IConfigurableComponentStateContext<TSettings = any>
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags>,
  IConfigurableComponentProps {
  settings: TSettings;
}

export interface IComponentLoadErrorPayload {
  error: string;
}

export interface IComponentSaveErrorPayload {
  error: string;
}

export interface IComponentSaveSuccessPayload {
  settings: object;
}

export interface IComponentLoadSuccessPayload<TSettings = any> {
  id?: string;
  name?: string;
  description?: string;
  settings: TSettings;
}

export interface IConfigurableComponentActionsContext<TSettings extends any>
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  load: () => void;
  save: (settings: TSettings) => Promise<void>;
}

export interface IConfigurableComponentContext<TSettings>
  extends IConfigurableComponentStateContext<TSettings>,
  IConfigurableComponentActionsContext<TSettings> {}

export const getContextInitialState = <TSettings extends any>(
  defaultSettings: TSettings,
): IConfigurableComponentStateContext<TSettings> => {
  return {
    isInProgress: {},
    succeeded: {},
    error: {},
    actioned: {},
    settings: defaultSettings,
  };
};

export const getConfigurableComponentStateContext = <TSettings extends any>(
  initialState: IConfigurableComponentStateContext<TSettings>,
): Context<IConfigurableComponentStateContext<TSettings>> => createNamedContext<IConfigurableComponentStateContext<TSettings>>(initialState, "ConfigurableComponentStateContext");

export const getConfigurableComponentActionsContext = <TSettings extends any>(): Context<IConfigurableComponentActionsContext<TSettings>> =>
  createNamedContext<IConfigurableComponentActionsContext<TSettings>>(undefined, "ConfigurableComponentActionsContext");
