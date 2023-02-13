import { createAction } from 'redux-actions';
import { ApplicationMode, ConfigurationItemsViewMode } from './models';

export enum AppConfiguratorActionEnums {
  SwitchMode = 'SWITCH_MODE',
  ToggleEditModeConfirmation = 'TOGGLE_EDIT_MODE_CONFIRMATION',
  ToggleCloseEditModeConfirmation = 'TOGGLE_CLOSE_EDIT_MODE_CONFIRMATION',
  SwitchConfigurationItemsMode = 'SWITCH_CONFIGURATION_ITEMS_MODE',
  ToggleFormInfoBlock = 'TOGGLE_FORM_INFO_BLOCK',
}

export const toggleShowInfoBlockAction = createAction<boolean, boolean>(
  AppConfiguratorActionEnums.ToggleFormInfoBlock,
  p => p
);

export const switchApplicationModeAction = createAction<ApplicationMode, ApplicationMode>(
  AppConfiguratorActionEnums.SwitchMode,
  p => p
);

export const switchConfigurationItemModeAction = createAction<ConfigurationItemsViewMode, ConfigurationItemsViewMode>(
  AppConfiguratorActionEnums.SwitchConfigurationItemsMode,
  p => p
);

export const toggleEditModeConfirmationAction = createAction<boolean, boolean>(
  AppConfiguratorActionEnums.ToggleEditModeConfirmation,
  p => p
);

export const toggleCloseEditModeConfirmationAction = createAction<boolean, boolean>(
  AppConfiguratorActionEnums.ToggleCloseEditModeConfirmation,
  p => p
);

/* NEW_ACTION_GOES_HERE */
