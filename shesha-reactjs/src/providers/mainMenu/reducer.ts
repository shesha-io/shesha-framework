import { createReducer } from '@reduxjs/toolkit';
import { setItemsAction, setLoadedMenuAction } from './actions';
import { MAIN_MENU_CONTEXT_INITIAL_STATE } from './contexts';

export const reducer = createReducer(MAIN_MENU_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setLoadedMenuAction, (state, { payload }) => {
      return {
        ...state,
        loadedMenu: payload,
      };
    })
    .addCase(setItemsAction, (state, { payload }) => {
      return {
        ...state,
        items: payload,
      };
    })
  ;
});
