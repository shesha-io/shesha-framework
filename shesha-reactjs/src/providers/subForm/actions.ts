import { createAction } from 'redux-actions';
import { FormMarkupWithSettings, IFlatComponentsStructure } from '../form/models';
import { IFetchDataErrorPayload, IFetchDataSuccessPayload, IPersistedFormPayload } from './contexts';

export enum SubFormActionEnums {
  SetMarkupWithSettings = 'SET_MARKUP_WITH_SETTINGS',
  FetchDataRequest = 'FETCH_DATA_REQUEST',
  FetchDataSuccess = 'FETCH_DATA_SUCCESS',
  FetchDataError = 'FETCH_DATA_ERROR',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export interface IPersistedFormPropsWithComponents extends FormMarkupWithSettings, IPersistedFormPayload {
  hasFetchedConfig?: boolean;
}

interface ISubformMarkupAndSettings extends IPersistedFormPropsWithComponents, IFlatComponentsStructure {}

export const setMarkupWithSettingsAction = createAction<ISubformMarkupAndSettings, ISubformMarkupAndSettings>(
  SubFormActionEnums.SetMarkupWithSettings,
  (p) => p,
);

export const fetchDataRequestAction = createAction<void, void>(SubFormActionEnums.FetchDataRequest, (p) => p);
export const fetchDataSuccessAction = createAction<IFetchDataSuccessPayload, IFetchDataSuccessPayload>(
  SubFormActionEnums.FetchDataSuccess,
  (p) => p,
);
export const fetchDataErrorAction = createAction<IFetchDataErrorPayload, IFetchDataErrorPayload>(
  SubFormActionEnums.FetchDataError,
  (p) => p,
);

/* NEW_ACTION_GOES_HERE */
