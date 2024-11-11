import { ApplicationMode, ConfigurationItemsViewMode } from './models';
import { createNamedContext } from '@/utils/react';

export interface IAppStateContext {
  editModeConfirmationVisible: boolean;
  closeEditModeConfirmationVisible: boolean;
  mode: ApplicationMode;
  configurationItemMode: ConfigurationItemsViewMode;
  formInfoBlockVisible: boolean;
  softInfoBlock: boolean;
}

export interface IAppActionsContext {
  switchApplicationMode: (mode: ApplicationMode) => void;
  switchConfigurationItemMode: (mode: ConfigurationItemsViewMode) => void;
  toggleEditModeConfirmation: (visible: boolean) => void;
  toggleCloseEditModeConfirmation: (visible: boolean) => void;
  toggleShowInfoBlock: (visible: boolean) => void;
  softToggleInfoBlock: (softInfoBlock: boolean) => void;
}

export const APP_CONTEXT_INITIAL_STATE: IAppStateContext = {
  editModeConfirmationVisible: false,
  closeEditModeConfirmationVisible: false,
  mode: 'live',
  configurationItemMode: 'live',
  formInfoBlockVisible: false,
  softInfoBlock: true,
};

export const AppConfiguratorStateContext = createNamedContext<IAppStateContext>(APP_CONTEXT_INITIAL_STATE, "AppConfiguratorStateContext");

export const AppConfiguratorActionsContext = createNamedContext<IAppActionsContext>(undefined, "AppConfiguratorActionsContext");
