import { TypeDefinition, TypeDefinitionLoader } from "@/interfaces/metadata";
import { MetadataBuilder } from "@/utils/metadata/metadataBuilder";
import userApiCode from "./metadata.public.ts?raw";

const getUserApiTypeDefinition: TypeDefinitionLoader = (): Promise<TypeDefinition> => {
    return Promise.resolve({
        typeName: "UserApi",
        files: [{
            content: userApiCode,
            fileName: "apis/userApi.d.ts",
        }],        
    });
};

export const getUserApiProperties = (builder: MetadataBuilder): MetadataBuilder =>
    builder
        .addBoolean("isLoggedIn", "Is logged in")
        .addString("id", "Id")
        .addString("userName", "User Name")
        .addString("firstName", "First Name")
        .addString("lastName", "Last Name")
        .setTypeDefinition(getUserApiTypeDefinition);