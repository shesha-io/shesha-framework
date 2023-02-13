import { createAction } from 'redux-actions';
import { FormMarkupWithSettings } from '../form/models';
import { IPersistedFormPayload } from './contexts';

export enum SubFormActionEnums {
  SetMarkupWithSettings = 'SET_MARKUP_WITH_SETTINGS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

interface IIPersistedFormPropsWithComponents extends FormMarkupWithSettings, IPersistedFormPayload {
  hasFetchedConfig?: boolean;
}

export const setMarkupWithSettingsAction = createAction<
  IIPersistedFormPropsWithComponents,
  IIPersistedFormPropsWithComponents
>(SubFormActionEnums.SetMarkupWithSettings, p => p);

/* NEW_ACTION_GOES_HERE */
