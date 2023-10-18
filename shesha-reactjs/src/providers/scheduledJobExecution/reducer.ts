import flagsReducer from '../utils/flagsReducer';
import { ScheduledJobExecutionActionEnums } from './actions';
import { IScheduledJobExecutionStateContext } from './contexts';

export function scheduledJobExecutionReducer(
  incomingState: IScheduledJobExecutionStateContext,
  action: ReduxActions.Action<IScheduledJobExecutionStateContext>
): IScheduledJobExecutionStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case ScheduledJobExecutionActionEnums.GetExecutionLogRequest:
    case ScheduledJobExecutionActionEnums.GetExecutionLogSuccess:
    case ScheduledJobExecutionActionEnums.GetExecutionLogError:
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };
    case ScheduledJobExecutionActionEnums.AddExecutionLogEvent: {
      const { executionLogEvents } = state;
      const { eventToAdd } = payload;

      return {
        ...state,
        executionLogEvents: [...executionLogEvents, eventToAdd],
      };
    }

    default: {
      return state;
    }
  }
}
