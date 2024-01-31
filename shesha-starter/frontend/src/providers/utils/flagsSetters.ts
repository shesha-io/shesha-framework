import { IFlagsSetters, IFlagsState } from 'models';
import { FlagsActionTypes } from 'enums';
import { createAction } from 'redux-actions';

export function getFlagSetters<A extends string, B extends string, C extends string, D extends string>(
  dispatch: (action: any) => void
): IFlagsSetters<A, B, C, D> {
  type IState = IFlagsState<A, B, C, D>;
  //#region Set flags
  const setIsInProgressFlagAction = createAction<IState, { [key in A]?: boolean }>(
    FlagsActionTypes.SetIsInProgressFlag,
    key => ({
      isInProgress: key,
    })
  );

  const setSucceededFlagAction = createAction<IState, { [key in B]?: boolean }>(
    FlagsActionTypes.SetSucceededFlag,
    key => ({
      succeeded: key,
    })
  );

  const setFailedFlagAction = createAction<IState, { [key in C]?: boolean }>(FlagsActionTypes.SetErrorFlag, key => ({
    error: key,
  }));

  const setActionedFlagAction = createAction<IState, { [key in D]?: boolean }>(
    FlagsActionTypes.SetActionedFlag,
    key => ({
      actioned: key,
    })
  );
  //#endregion

  //#region Reset flags
  const resetIsInProgressFlagAction = createAction<IState>(FlagsActionTypes.ResetIsInProgressFlags);

  const resetSucceededFlagAction = createAction<IState>(FlagsActionTypes.ResetSucceededFlags);

  const resetFailedFlagAction = createAction<IState>(FlagsActionTypes.ResetErrorFlags);

  const resetActionedFlagAction = createAction<IState>(FlagsActionTypes.ResetActionedFlags);

  const resetAllFlagAction = createAction<IState>(FlagsActionTypes.ResetAllFlags);

  //#endregion

  return {
    setIsInProgressFlag: (val: { [key in A]?: boolean }) => dispatch(setIsInProgressFlagAction(val)),
    setSucceededFlag: (val: { [key in B]?: boolean }) => dispatch(setSucceededFlagAction(val)),
    setFailedFlag: (val: { [key in C]?: boolean }) => dispatch(setFailedFlagAction(val)),
    setActionedFlag: (val: { [key in D]?: boolean }) => dispatch(setActionedFlagAction(val)),
    resetIsInProgressFlag: () => dispatch(resetIsInProgressFlagAction(null)), // These actions are not supposed to be receiving anything. But I get an error saying they do. Will fix them later
    resetSucceededFlag: () => dispatch(resetSucceededFlagAction(null)), // These actions are not supposed to be receiving anything. But I get an error saying they do. Will fix them later
    resetFailedFlag: () => dispatch(resetFailedFlagAction(null)), // These actions are not supposed to be receiving anything. But I get an error saying they do. Will fix them later
    resetActionedFlag: () => dispatch(resetActionedFlagAction(null)), // These actions are not supposed to be receiving anything. But I get an error saying they do. Will fix them later
    resetAllFlag: () => dispatch(resetAllFlagAction(null)), // These actions are not supposed to be receiving anything. But I get an error saying they do. Will fix them later
  };
}
