import { createAction } from 'redux-actions';
import { FormMarkupWithSettings } from '../form/models';
import { IFetchDataErrorPayload, IPersistedFormPayload } from './contexts';

export enum SubFormActionEnums {
  SetMarkupWithSettings = 'SET_MARKUP_WITH_SETTINGS',
  FetchDataRequest = 'FETCH_DATA_REQUEST',
  FetchDataSuccess = 'FETCH_DATA_SUCCESS',
  FetchDataError = 'FETCH_DATA_ERROR',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

interface IIPersistedFormPropsWithComponents extends FormMarkupWithSettings, IPersistedFormPayload {
  hasFetchedConfig?: boolean;
}

export const setMarkupWithSettingsAction = createAction<
  IIPersistedFormPropsWithComponents,
  IIPersistedFormPropsWithComponents
>(SubFormActionEnums.SetMarkupWithSettings, p => p);

export const fetchDataRequestAction = createAction<void, void>(SubFormActionEnums.FetchDataRequest, p => p);
export const fetchDataSuccessAction = createAction<void, void>(SubFormActionEnums.FetchDataSuccess, p => p);
export const fetchDataErrorAction = createAction<IFetchDataErrorPayload, IFetchDataErrorPayload>(SubFormActionEnums.FetchDataError, p => p);

/* NEW_ACTION_GOES_HERE */
