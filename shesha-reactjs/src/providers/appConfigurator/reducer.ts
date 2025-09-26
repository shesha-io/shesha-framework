import { softToggleInfoBlockAction, switchApplicationModeAction, toggleCloseEditModeConfirmationAction, toggleEditModeConfirmationAction } from './actions';
import { APP_CONTEXT_INITIAL_STATE } from './contexts';
import { createReducer } from '@reduxjs/toolkit';

const reducer = createReducer(APP_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(switchApplicationModeAction, (state, { payload }) => {
      state.mode = payload;
      state.editModeConfirmationVisible = false;
      state.closeEditModeConfirmationVisible = false;
    })
    .addCase(toggleEditModeConfirmationAction, (state, { payload }) => {
      state.editModeConfirmationVisible = payload;
      state.closeEditModeConfirmationVisible = !payload;
    })
    .addCase(toggleCloseEditModeConfirmationAction, (state, { payload }) => {
      state.closeEditModeConfirmationVisible = payload;
      state.editModeConfirmationVisible = !payload;
    })
    .addCase(softToggleInfoBlockAction, (state, { payload }) => {
      state.softInfoBlock = payload;
    });
});

export default reducer;
