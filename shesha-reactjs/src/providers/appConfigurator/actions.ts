import { ApplicationMode } from './models';
import { createAction } from '@reduxjs/toolkit';

export enum AppConfiguratorActionEnums {
  SwitchMode = 'SWITCH_MODE',
  ToggleEditModeConfirmation = 'TOGGLE_EDIT_MODE_CONFIRMATION',
  ToggleCloseEditModeConfirmation = 'TOGGLE_CLOSE_EDIT_MODE_CONFIRMATION',
  SoftToggleInfoBlock = 'SOFT_TOGGLE_INFO_BLOCK',
}

export const switchApplicationModeAction = createAction<ApplicationMode>(AppConfiguratorActionEnums.SwitchMode);

export const toggleEditModeConfirmationAction = createAction<boolean>(AppConfiguratorActionEnums.ToggleEditModeConfirmation);

export const toggleCloseEditModeConfirmationAction = createAction<boolean>(AppConfiguratorActionEnums.ToggleCloseEditModeConfirmation);

export const softToggleInfoBlockAction = createAction<boolean>(AppConfiguratorActionEnums.SoftToggleInfoBlock);
