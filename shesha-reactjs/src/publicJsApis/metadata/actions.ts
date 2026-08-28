import { IObjectMetadataBuilder, MetadataBuilderAction } from "@/utils/metadata/metadataBuilder";

import actionsApiDefinition from "../apis/actions.ts?raw";
import messageApiDefinition from "../apis/message.ts?raw";
import httpApiDefinition from "../apis/httpClient.ts?raw";
import modalApiDefinition from "../apis/modal.ts?raw";

export const getActionsPublicApiRegistration: MetadataBuilderAction = (builder: IObjectMetadataBuilder) => {
  builder.addObject('actions', "Actions API", (pb) => pb
    .setTypeDefinition(() =>
      Promise.resolve({
        typeName: "IActionsApi",
        files: [
          { content: actionsApiDefinition, fileName: "apis/actions.ts" },
          { content: messageApiDefinition, fileName: "apis/message.ts" },
          { content: httpApiDefinition, fileName: "apis/httpClient.ts" },
          { content: modalApiDefinition, fileName: "apis/modal.ts" },
        ],
      })));
};

