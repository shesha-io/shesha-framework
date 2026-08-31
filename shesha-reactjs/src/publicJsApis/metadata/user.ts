import { IObjectMetadataBuilder, MetadataBuilderAction } from "@/utils/metadata/metadataBuilder";

import userApiDefinition from "../apis/user.ts?raw";

export const getUserPublicApiRegistration: MetadataBuilderAction = (builder: IObjectMetadataBuilder) => {
  builder.addObject('user', "User API", (pb) => pb
    .setTypeDefinition(() => Promise.resolve({ typeName: "ICurrentUserApi", files: [{ content: userApiDefinition, fileName: "apis/user.ts" }] })));
};

