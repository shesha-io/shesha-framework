import { createAction } from '@reduxjs/toolkit';
import { ISetMetadataPayload } from './contexts';

enum MetadataActionEnums {
  SetMetadata = 'SET_METADATA',
}

export const setMetadataAction = createAction<ISetMetadataPayload>(MetadataActionEnums.SetMetadata);
