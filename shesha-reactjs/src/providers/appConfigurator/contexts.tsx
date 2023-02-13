import { createContext } from 'react';
import { ApplicationMode, ConfigurationItemsViewMode } from './models';

export interface IAppStateContext {
  editModeConfirmationVisible: boolean;
  closeEditModeConfirmationVisible: boolean;
  mode: ApplicationMode;
  configurationItemMode: ConfigurationItemsViewMode;
  formInfoBlockVisible: boolean;
}

export interface IAppActionsContext {
  switchApplicationMode: (mode: ApplicationMode) => void;
  switchConfigurationItemMode: (mode: ConfigurationItemsViewMode) => void;
  toggleEditModeConfirmation: (visible: boolean) => void;
  toggleCloseEditModeConfirmation: (visible: boolean) => void;
  // fetchSettings: (id: string) => Promise<IComponentSettings>;
  // getSettings: (id: string) => IComponentSettings | null;
  // invalidateSettings: (id: string) => void;
  toggleShowInfoBlock: (visible: boolean) => void;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const APP_CONTEXT_INITIAL_STATE: IAppStateContext = {
  editModeConfirmationVisible: false,
  closeEditModeConfirmationVisible: false,
  mode: 'live',
  configurationItemMode: 'live',
  formInfoBlockVisible: false,
};

export const AppConfiguratorStateContext = createContext<IAppStateContext>(APP_CONTEXT_INITIAL_STATE);

export const AppConfiguratorActionsContext = createContext<IAppActionsContext>(undefined);
