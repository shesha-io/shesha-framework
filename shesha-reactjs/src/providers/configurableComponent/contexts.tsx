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

export interface IConfigurableComponentStateContext<TSettings extends object = object>
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

export interface IComponentLoadSuccessPayload<TSettings extends object = object> {
  id?: string;
  name?: string;
  description?: string;
  settings: TSettings;
}

export interface IConfigurableComponentActionsContext<TSettings extends object>
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  load: () => void;
  save: (settings: TSettings) => Promise<void>;
}

export interface IConfigurableComponentContext<TSettings extends object = object>
  extends IConfigurableComponentStateContext<TSettings>,
  IConfigurableComponentActionsContext<TSettings> {}

export const getContextInitialState = <TSettings extends object = object>(
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

export const getConfigurableComponentStateContext = <TSettings extends object = object>(): Context<IConfigurableComponentStateContext<TSettings> | undefined> => createNamedContext<IConfigurableComponentStateContext<TSettings> | undefined>(undefined, "ConfigurableComponentStateContext");

export const getConfigurableComponentActionsContext = <TSettings extends object = object>(): Context<IConfigurableComponentActionsContext<TSettings> | undefined> =>
  createNamedContext<IConfigurableComponentActionsContext<TSettings> | undefined>(undefined, "ConfigurableComponentActionsContext");
