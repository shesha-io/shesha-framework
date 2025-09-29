import { ApplicationMode } from './models';
import { createNamedContext } from '@/utils/react';

export interface IAppStateContext {
  editModeConfirmationVisible: boolean;
  closeEditModeConfirmationVisible: boolean;
  mode: ApplicationMode;
  formInfoBlockVisible: boolean;
  softInfoBlock: boolean;
}

export interface IAppActionsContext {
  switchApplicationMode: (mode: ApplicationMode) => void;
  toggleEditModeConfirmation: (visible: boolean) => void;
  toggleCloseEditModeConfirmation: (visible: boolean) => void;
  toggleShowInfoBlock: (visible: boolean) => void;
  softToggleInfoBlock: (softInfoBlock: boolean) => void;
}

export const APP_CONTEXT_INITIAL_STATE: IAppStateContext = {
  editModeConfirmationVisible: false,
  closeEditModeConfirmationVisible: false,
  mode: 'live',
  formInfoBlockVisible: false,
  softInfoBlock: true,
};

export const AppConfiguratorStateContext = createNamedContext<IAppStateContext | undefined>(APP_CONTEXT_INITIAL_STATE, "AppConfiguratorStateContext");

export const AppConfiguratorActionsContext = createNamedContext<IAppActionsContext | undefined>(undefined, "AppConfiguratorActionsContext");
