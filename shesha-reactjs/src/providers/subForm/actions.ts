import { FormMarkupWithSettings, IFlatComponentsStructure } from '../form/models';
import { IFetchDataErrorPayload, IFetchDataSuccessPayload, IPersistedFormPayload } from './contexts';
import { createAction } from '@reduxjs/toolkit';

export enum SubFormActionEnums {
  SetMarkupWithSettings = 'SET_MARKUP_WITH_SETTINGS',
  FetchDataRequest = 'FETCH_DATA_REQUEST',
  FetchDataSuccess = 'FETCH_DATA_SUCCESS',
  FetchDataError = 'FETCH_DATA_ERROR',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export interface IPersistedFormPropsWithComponents extends FormMarkupWithSettings, IPersistedFormPayload {
  hasFetchedConfig: boolean;
}

interface ISubformMarkupAndSettings extends IPersistedFormPropsWithComponents, IFlatComponentsStructure {}

export const setMarkupWithSettingsAction = createAction<ISubformMarkupAndSettings>(SubFormActionEnums.SetMarkupWithSettings);
export const fetchDataRequestAction = createAction<void>(SubFormActionEnums.FetchDataRequest);
export const fetchDataSuccessAction = createAction<IFetchDataSuccessPayload>(SubFormActionEnums.FetchDataSuccess);
export const fetchDataErrorAction = createAction<IFetchDataErrorPayload>(SubFormActionEnums.FetchDataError);
