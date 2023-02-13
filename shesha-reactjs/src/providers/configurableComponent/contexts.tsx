import { createContext } from 'react';
import { IFlagsState, IFlagsSetters } from '../../interfaces';
import { IConfigurableComponentProps } from './models';

export type IFlagProgressFlags = 'load' | 'save' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = 'load' | 'save' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = 'load' | 'save' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface ILayoutProps {
  span: number;
}

export interface IConfigurableComponentStateContext<TSettings extends any>
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags>,
    IConfigurableComponentProps {
  settings: TSettings;
}

export interface IComponentLoadPayload {
  //id: string;
}

export interface IComponentLoadErrorPayload {
  error: string;
}

export interface IComponentSavePayload {}

export interface IComponentSaveErrorPayload {
  error: string;
}

export interface IComponentSaveSuccessPayload {
  settings: object;
}

export interface IComponentLoadSuccessPayload {
  id?: string;
  name?: string;
  description?: string;
  settings: object;
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
  defaultSettings: TSettings
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
  initialState: IConfigurableComponentStateContext<TSettings>
) => createContext<IConfigurableComponentStateContext<TSettings>>(initialState);

export const getConfigurableComponentActionsContext = <TSettings extends any>() =>
  createContext<IConfigurableComponentActionsContext<TSettings>>(undefined);
