import { createAction } from 'redux-actions';
import IRequestHeaders from '../../interfaces/requestHeaders';

export enum SheshaApplicationActionEnums {
    SetRequestHeaders = 'SET_REQUEST_HEADERS',
    SetBackendUrl = 'SET_BACKEND_URL',
};

export const setHeadersAction = createAction<IRequestHeaders, IRequestHeaders>(SheshaApplicationActionEnums.SetRequestHeaders, p => (p));

export const setBackendUrlAction = createAction<string, string>(SheshaApplicationActionEnums.SetBackendUrl, p => (p));