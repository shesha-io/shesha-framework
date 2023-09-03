import { createAction } from 'redux-actions';
import { IProperty } from './models';

export enum QueryBuilderActionEnums {
  SetFields = 'SET_FIELDS',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setFieldsAction = createAction<IProperty[], IProperty[]>(QueryBuilderActionEnums.SetFields, (p) => p);

/* NEW_ACTION_GOES_HERE */
