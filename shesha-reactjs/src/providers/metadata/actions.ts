import { createAction } from 'redux-actions';
import { ISetMetadataPayload } from './contexts';

export enum MetadataActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  SetMetadata = 'SET_METADATA',
}

/* NEW_ACTION_GOES_HERE */

export const setMetadataAction = createAction<ISetMetadataPayload, ISetMetadataPayload>(
  MetadataActionEnums.SetMetadata,
  p => p
);