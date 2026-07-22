import { fetchDataErrorAction, fetchDataRequestAction, fetchDataSuccessAction, setMarkupWithSettingsAction } from './actions';
import { SUB_FORM_CONTEXT_INITIAL_STATE } from './contexts';
import { createReducer } from '@reduxjs/toolkit';

export const subFormReducer = createReducer(SUB_FORM_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setMarkupWithSettingsAction, (state, { payload }) => {
      return { ...state, ...payload };
    })
    .addCase(fetchDataRequestAction, (state) => {
      state.errors = { ...state.errors, getData: undefined };
      state.loading = { ...state.loading, getData: true };
    })
    .addCase(fetchDataSuccessAction, (state, { payload }) => {
      state.fetchedEntityId = payload.entityId;
      state.errors = { ...state.errors, getData: undefined };
      state.loading = { ...state.loading, getData: false };
    })
    .addCase(fetchDataErrorAction, (state, { payload }) => {
      state.fetchedEntityId = undefined;
      state.errors = { ...state.errors, getData: payload.error };
      state.loading = { ...state.loading, getData: false };
    });
});
