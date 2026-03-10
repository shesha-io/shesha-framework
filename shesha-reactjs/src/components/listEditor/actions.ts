import { createAction } from 'redux-actions';
import { ListMode } from './models';

export enum ListActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  SwitchMode = 'SWITCH_MODE',
}

/* NEW_ACTION_GOES_HERE */

export interface ISwitchModeActionPayload {
  mode: ListMode;
  allowChangeMode: boolean;
}

export const switchModeAction = createAction<ISwitchModeActionPayload, ISwitchModeActionPayload>(
  ListActionEnums.SwitchMode,
  (p) => p,
);
