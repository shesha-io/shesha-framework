import { TypeDefinition, TypeDefinitionLoader } from "@/interfaces/metadata";
import { IObjectMetadataBuilder } from "@/utils/metadata/metadataBuilder";

const getFormsApiTypeDefinition: TypeDefinitionLoader = (): Promise<TypeDefinition> => {
  var formsSource = [
    "/**",
    " * Forms API",
    " */",
    "export interface FormsApi {",
    "    /**",
    "     * Prepare form markup using form template",
    "     */",
    "    prepareTemplateAsync: (templateId: string, replacements: object) => Promise<string>;",
    "}",
  ].join("\n");
  return Promise.resolve({
    typeName: "FormsApi",
    files: [{
      content: formsSource,
      fileName: "apis/formsApi.d.ts",
    }],
  });
};

export const getFormsApiProperties = (builder: IObjectMetadataBuilder): IObjectMetadataBuilder =>
  builder
    .setTypeDefinition(getFormsApiTypeDefinition);
