import { loadErrorAction, loadRequestAction, loadSuccessAction, resetAction, saveErrorAction, saveRequestAction, saveSuccessAction, updateFormSettingsAction } from './actions';
import { FORM_PERSISTER_CONTEXT_INITIAL_STATE } from './contexts';
import { createReducer } from '@reduxjs/toolkit';

const reducer = createReducer(FORM_PERSISTER_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(resetAction, () => {
      return { ...FORM_PERSISTER_CONTEXT_INITIAL_STATE };
    })
    .addCase(loadRequestAction, (state, { payload }) => {
      state.formId = payload.formId;
      state.loading = true;
      state.loadError = undefined;
    })
    .addCase(loadSuccessAction, (state, { payload }) => {
      return {
        ...state,
        formProps: payload,
        loaded: true,
        loading: false,
        loadError: undefined,
      };
    })
    .addCase(loadErrorAction, (state, { payload }) => {
      state.loading = false;
      state.loaded = false;
      state.loadError = payload;
    })
    .addCase(updateFormSettingsAction, (state, { payload }) => {
      return {
        ...state,
        formSettings: payload,
      };
    })
    .addCase(saveRequestAction, (state) => {
      state.saving = true;
      state.saved = false;
      state.saveError = undefined;
    })
    .addCase(saveSuccessAction, (state) => {
      state.saving = false;
      state.saved = true;
      state.saveError = undefined;
    })
    .addCase(saveErrorAction, (state, { payload }) => {
      state.saving = false;
      state.saveError = payload;
    });
});


export default reducer;
