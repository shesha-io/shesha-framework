import { IModelMetadata } from "@/interfaces";
import { IObjectMetadataBuilder } from "@/utils";
import { MetadataBuilderAction } from "@/utils/metadata/metadataBuilder";

import modalApiDefinition from "../apis/modal.ts?raw";

const buildUtilsPublicApiMetadata = (builder: IObjectMetadataBuilder): void => {
  builder.addObject('utils', "Utils", (m) => m
    .addCustom('modal', "API for displaying modal dialogs and forms", () => {
      return Promise.resolve({ typeName: 'ModalApi', files: [{ content: modalApiDefinition, fileName: 'apis/modal.ts' }] });
    })
    .addCustom('moment', "The moment.js object", () => {
      return fetch("https://unpkg.com/moment@2.25.3/ts3.1-typings/moment.d.ts")
        .then((response) => response.text())
        .then((response) => {
          const momentWrapper = `import moment from 'apis/moment';\r\ntype MomentApi = typeof moment;\r\nexport { MomentApi };`;
          return { typeName: 'MomentApi', files: [
            { content: momentWrapper, fileName: 'apis/momentApi.ts' },
            { content: response, fileName: 'apis/moment.d.ts' },
          ] };
        })
        .catch((error) => {
          console.error("Failed to fetch moment.d.ts for UtilsApi", error);
          throw error;
        });
    })
    .addCustom('saveAs', "API for saving files", () => {
      return Promise.resolve({ typeName: '(data: Blob | string, filename?: string) => void', files: [] });
    })
    .addCustom('evaluateString', "Evaluate string using Mustache syntax (see https://mustache.github.io/)", () => {
      return Promise.resolve({ typeName: '(template: string, data: any) => string', files: [] });
    })
    .addCustom('getFormUrl', "Get form url", () => {
      return Promise.resolve({ typeName: '(formId: { name: string; module: string | null } | string) => string', files: [] });
    })
    .addCustom('prepareUrl', "Prepare url (apply conventions)", () => {
      return Promise.resolve({ typeName: '(url: string) => string', files: [] });
    }));
};

export const getUtilsPublicApiMetadata = (builder: IObjectMetadataBuilder): IModelMetadata => {
  buildUtilsPublicApiMetadata(builder);
  return builder.build();
};

export const getUtilsPublicApiRegistration: MetadataBuilderAction = (builder: IObjectMetadataBuilder) => buildUtilsPublicApiMetadata(builder);

