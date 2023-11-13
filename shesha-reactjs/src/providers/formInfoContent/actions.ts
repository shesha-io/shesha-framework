import { createAction } from 'redux-actions';
import { IFormDesignerActionFlag } from './models';
import { ReactNode } from 'react';

export enum FormInfoContentStateActionEnums {
  SetActionFlag = 'SET_ACTION_FLAG',
  SetToolbarRightButton = 'SET_TOOLBAR_RIGHT_BUTTON',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setActionFlagAction = createAction<IFormDesignerActionFlag, IFormDesignerActionFlag>(
  FormInfoContentStateActionEnums.SetActionFlag,
  (p) => p
);

export const setToolbarRightButtonAction = createAction<ReactNode, ReactNode>(
  FormInfoContentStateActionEnums.SetToolbarRightButton,
  (p) => p
);
/* NEW_ACTION_GOES_HERE */
