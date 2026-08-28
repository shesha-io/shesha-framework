import { createReducer } from '@reduxjs/toolkit';
import { setConnectionAction } from './actions';
import { SIGNAL_R_CONTEXT_INITIAL_STATE } from './contexts';

export const signalRReducer = createReducer(SIGNAL_R_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setConnectionAction, (state, { payload }) => {
      return {
        ...state,
        connection: payload,
      };
    });
  /* NEW_ACTION_ENUM_GOES_HERE */
});
