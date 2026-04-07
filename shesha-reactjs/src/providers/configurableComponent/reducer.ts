import { loadErrorAction, loadRequestAction, loadSuccessAction, saveErrorAction, saveRequestAction, saveSuccessAction } from './actions';
import {
  IConfigurableComponentStateContext,
} from './contexts';
import { createReducer } from '@reduxjs/toolkit';

type ReducerType<TSettings extends object> = ReturnType<typeof createReducer<IConfigurableComponentStateContext<TSettings>>>;

const reducerFactory = <TSettings extends object>(
  initialState: IConfigurableComponentStateContext<TSettings>,
): ReducerType<TSettings> =>
  createReducer(initialState, (builder) => {
    builder
      .addCase(loadRequestAction, (state) => {
        return {
          ...state,
          isInProgress: { ...state.isInProgress, loading: true },
        };
      })
      .addCase(loadSuccessAction, (state, { payload }) => {
        const settings = payload.settings as TSettings;

        const typedPayload = { ...payload, settings };

        return {
          ...state,
          ...typedPayload,
          isInProgress: { ...state.isInProgress, loading: false },
          error: { ...state.error, loading: null },
        };
      })
      .addCase(loadErrorAction, (state, { payload }) => {
        return {
          ...state,
          isInProgress: { ...state.isInProgress, loading: false },
          error: { ...state.error, loading: payload.error },
        };
      })
      .addCase(saveRequestAction, (state) => {
        return {
          ...state,
          isInProgress: { ...state.isInProgress, save: true },
          error: { ...state.error, save: undefined },
        };
      })
      .addCase(saveSuccessAction, (state, { payload }) => {
        const settings = payload.settings as TSettings;

        return {
          ...state,
          settings,
          isInProgress: { ...state.isInProgress, save: false },
          error: { ...state.error, save: null },
        };
      })
      .addCase(saveErrorAction, (state, { payload }) => {
        return {
          ...state,
          isInProgress: { ...state.isInProgress, save: false },
          error: { ...state.error, save: payload.error },
        };
      })
    ;
  },
  );

export default reducerFactory;
