import { TypeDefinition, TypeDefinitionLoader } from "@/interfaces/metadata";
import { IObjectMetadataBuilder } from "@/utils/metadata/metadataBuilder";

const getNavigatorApiTypeDefinition: TypeDefinitionLoader = (): Promise<TypeDefinition> => {
  var navigatorSource = [
    "import { FormIdentifier } from './form';",
    "",
    "/**",
    " * Navigator API",
    " */",
    "export interface NavigatorApi {",
    "    /**",
    "     * Navigate to the given url",
    "     */",
    "    navigateToUrl: (url: string, queryParameters?: Record<string, string>) => void;",
    "    /**",
    "     * Navigate to the given form",
    "     */",
    "    navigateToForm: (formId: FormIdentifier, args?: Record<string, string>) => void;",
    "    /**",
    "     * Get form url",
    "     */",
    "    getFormUrl: (formId: FormIdentifier) => string;",
    "}",
  ].join("\n");

  return Promise.resolve({
    typeName: "NavigatorApi",
    files: [{
      content: navigatorSource,
      fileName: "apis/navigatorApi.d.ts",
    }],
  });
};

export const getNavigatorApiProperties = (builder: IObjectMetadataBuilder): IObjectMetadataBuilder =>
  builder
    .setTypeDefinition(getNavigatorApiTypeDefinition);
