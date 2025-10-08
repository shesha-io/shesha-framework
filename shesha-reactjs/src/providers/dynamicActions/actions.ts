import { createAction } from 'redux-actions';
import { ITestActionPayload } from './contexts';

export enum DynamicActionsActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  TestAction = 'TEST',
}

/* NEW_ACTION_GOES_HERE */

export const testAction = createAction<ITestActionPayload, ITestActionPayload>(
  DynamicActionsActionEnums.TestAction,
  (p) => p,
);
