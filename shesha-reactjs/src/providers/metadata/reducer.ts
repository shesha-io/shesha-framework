import { createReducer } from '@reduxjs/toolkit';
import { setMetadataAction } from './actions';
import { METADATA_CONTEXT_INITIAL_STATE } from './contexts';

const reducer = createReducer(METADATA_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setMetadataAction, (state, action) => {
      const { payload } = action;

      state.modelType = payload.modelType;
      state.dataType = payload.dataType;
      state.metadata = { ...payload.metadata };
    });
});

export default reducer;
