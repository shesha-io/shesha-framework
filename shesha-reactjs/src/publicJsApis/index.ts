import metadataSourceCode from './metadata.ts?raw';
import metadataBuilderSourceCode from './metadataBuilder.ts?raw';
import userApiSourceCode from './userApi.ts?raw';
import httpClientSourceCode from './httpClient.ts?raw';
import entitiesCode from './entities.ts?raw';
import webStorageCode from './webStorageApi.ts?raw';
import canvasContextCode from './canvasContextApi.ts?raw';
import dataTableContextCode from './dataTableContextApi.ts?raw';
import wizardApiCode from './wizardApi.ts?raw';

const CODE = {
  ENTITY_BASE_TYPES_PATH: 'entities/index.d.ts',
  METADATA_PATH: 'apis/metadata.d.ts',
  METADATA_BUILDER_PATH: 'apis/metadataBuilder.d.ts',
  ENVIRONMENT_TYPE: 'Environment',
  ENVIRONMENT_BACK_END: 'Environment.BackEnd',
  ENVIRONMENT_FRONT_END: 'Environment.FrontEnd',
};

export {
  metadataSourceCode,
  metadataBuilderSourceCode,
  userApiSourceCode,
  httpClientSourceCode,
  entitiesCode,
  webStorageCode,
  canvasContextCode,
  dataTableContextCode,
  wizardApiCode,
  CODE,
};
