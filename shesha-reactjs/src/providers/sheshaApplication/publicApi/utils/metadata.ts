import { TypeDefinition, TypeDefinitionLoader } from "@/interfaces/metadata";
import { MetadataBuilder } from "@/utils/metadata/metadataBuilder";

const getUtilsApiTypeDefinition: TypeDefinitionLoader = (): Promise<TypeDefinition> => {
    var userSource = [
        "/**",
        " * Utils API",
        " */",
        "export interface UtilsApi {",
        "    /**",
        "     * Evaluate string using Mustache syntax (see https://mustache.github.io/)",
        "     */",
        "    evaluateString: (template: string, data: any) => string;",
        "}",
    ].join("\n");
    
    return Promise.resolve({
        typeName: "UtilsApi",
        files: [{
            content: userSource,
            fileName: "apis/utilsApi.d.ts",
        }],        
    });
};

export const getUtilsApiProperties = (builder: MetadataBuilder): MetadataBuilder =>
    builder
        .setTypeDefinition(getUtilsApiTypeDefinition);