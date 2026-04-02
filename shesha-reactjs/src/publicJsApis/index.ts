import fileListContextCodeRaw from './fileListContextApi.ts?raw';
import metadataSourceCodeRaw from './metadata.ts?raw';
import metadataBuilderSourceCodeRaw from './metadataBuilder.ts?raw';
import userApiSourceCodeRaw from './userApi.ts?raw';
import httpClientSourceCodeRaw from './httpClient.ts?raw';
import entitiesCodeRaw from './entities.ts?raw';
import webStorageCodeRaw from './webStorageApi.ts?raw';
import canvasContextCodeRaw from './canvasContextApi.ts?raw';
import dataTableContextCodeRaw from './dataTableContextApi.ts?raw';
import wizardApiCodeRaw from './wizardApi.ts?raw';
import fileSaverRaw from './fileSaver.ts?raw';
import globalStateRaw from './globalState.ts?raw';
import queryStringRaw from './queryString.ts?raw';
import messageRaw from './message.ts?raw';

const CODE = {
  ENTITY_BASE_TYPES_PATH: 'entities/index.d.ts',
  METADATA_PATH: 'apis/metadata.d.ts',
  METADATA_BUILDER_PATH: 'apis/metadataBuilder.d.ts',
  ENVIRONMENT_TYPE: 'Environment',
  ENVIRONMENT_BACK_END: 'Environment.BackEnd',
  ENVIRONMENT_FRONT_END: 'Environment.FrontEnd',
};

const fileListContextCode = fileListContextCodeRaw as string;
const metadataSourceCode = metadataSourceCodeRaw as string;
const metadataBuilderSourceCode = metadataBuilderSourceCodeRaw as string;
const userApiSourceCode = userApiSourceCodeRaw as string;
const httpClientSourceCode = httpClientSourceCodeRaw as string;
const entitiesCode = entitiesCodeRaw as string;
const webStorageCode = webStorageCodeRaw as string;
const canvasContextCode = canvasContextCodeRaw as string;
const dataTableContextCode = dataTableContextCodeRaw as string;
const wizardApiCode = wizardApiCodeRaw as string;
const fileSaverCode = fileSaverRaw as string;
const globalStateCode = globalStateRaw as string;
const queryStringCode = queryStringRaw as string;
const messageCode = messageRaw as string;

export {
  fileListContextCode,
  metadataSourceCode,
  metadataBuilderSourceCode,
  userApiSourceCode,
  httpClientSourceCode,
  entitiesCode,
  webStorageCode,
  canvasContextCode,
  dataTableContextCode,
  wizardApiCode,
  fileSaverCode,
  globalStateCode,
  queryStringCode,
  messageCode,
  CODE,
};
