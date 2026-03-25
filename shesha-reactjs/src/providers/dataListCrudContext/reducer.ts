import { createReducer } from '@reduxjs/toolkit';
import {
  switchModeAction,
  setAutoSaveAction,
  setInitialValuesLoadingAction,
  setInitialValuesAction,
  setAllowEditAction,
  setAllowDeleteAction,
  resetErrorsAction,
  saveStartedAction,
  saveFailedAction,
  saveSuccessAction,
  deleteStartedAction,
  deleteFailedAction,
  deleteSuccessAction,
} from './actions';
import { CRUD_CONTEXT_INITIAL_STATE } from './contexts';

export const reducer = createReducer(CRUD_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(switchModeAction, (state, { payload }) => {
      state.mode = payload.mode;
      state.allowChangeMode = payload.allowChangeMode;
    })
    .addCase(setAutoSaveAction, (state, { payload }) => {
      state.autoSave = payload;
    })
    .addCase(setInitialValuesLoadingAction, (state, { payload }) => {
      state.initialValuesLoading = payload;
    })
    .addCase(setInitialValuesAction, (state, { payload }) => {
      return {
        ...state,
        initialValuesLoading: false,
        initialValues: payload,
      };
    })
    .addCase(setAllowEditAction, (state, { payload }) => {
      state.allowEdit = payload;
    })
    .addCase(setAllowDeleteAction, (state, { payload }) => {
      state.allowDelete = payload;
    })
    .addCase(resetErrorsAction, (state) => {
      state.saveError = undefined;
      state.deletingError = undefined;
    })
    .addCase(saveStartedAction, (state) => {
      state.isSaving = true;
      state.saveError = undefined;
    })
    .addCase(saveFailedAction, (state, { payload }) => {
      return {
        ...state,
        saveError: payload,
        isSaving: false,
      };
    })
    .addCase(saveSuccessAction, (state) => {
      state.isSaving = false;
      state.saveError = undefined;
    })
    .addCase(deleteStartedAction, (state) => {
      state.isDeleting = true;
      state.deletingError = undefined;
    })
    .addCase(deleteFailedAction, (state, { payload }) => {
      return {
        ...state,
        deletingError: payload,
        isDeleting: false,
      };
    })
    .addCase(deleteSuccessAction, (state) => {
      state.isDeleting = false;
      state.deletingError = undefined;
    });
});

export default reducer;
