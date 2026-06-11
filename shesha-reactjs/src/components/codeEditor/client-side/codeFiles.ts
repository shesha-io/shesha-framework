import { asPropertiesArray, IObjectMetadata, isPropertiesArray, isPropertiesLoader, ModelTypeIdentifier, NestedProperties, PropertiesPromise } from "@/interfaces/metadata";
import { makeCodeTemplate, TextTemplate } from "./utils";
import { isArrayType, isEntityType, isObjectType, ResultType } from "../models";
import { TypesBuilder } from "@/utils/metadata/typesBuilder";
import { isEmptyString, trimSuffix } from "@/utils/string";
import { DTS_EXTENSION, TypesImporter } from "@/utils/metadata/typesImporter";
import { Environment } from "@/publicJsApis/metadataBuilder";
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from "@/utils/nullables";

export interface ISourceCodeFile {
  content: string;
  filePath: string;
}

export type BuildSourceCodeFilesArgs = {
  wrapInTemplate: boolean;
  fileName: string;
  directory: string;
  availableConstants?: IObjectMetadata | (() => Promise<IObjectMetadata>) | undefined;
  resultType?: ResultType | undefined;
  metadataFetcher: (typeId: ModelTypeIdentifier) => Promise<IObjectMetadata | null>;
  environment: Environment;
  useAsyncDeclaration?: boolean | undefined;
  functionName?: string | undefined;
};
export type BuildSourceCodeFilesResponse = {
  template: ((code: string) => TextTemplate) | undefined;
  sourceFiles: ISourceCodeFile[];
};

const getVariablesFileName = (fileName: string): string => `${fileName}.variables.d.ts`;
const getResponseFileName = (fileName: string): string => `${fileName}.result.d.ts`;

const fetchProperties = (properties: NestedProperties): PropertiesPromise => {
  return isPropertiesArray(properties)
    ? Promise.resolve(properties)
    : isPropertiesLoader(properties)
      ? properties()
      : Promise.resolve([]);
};

const getVariablesImportBlock = async (constantsMetadata: IObjectMetadata | (() => Promise<IObjectMetadata>) | undefined, variablesFileName: string): Promise<string> => {
  const meta = typeof (constantsMetadata) === "function"
    ? await constantsMetadata()
    : constantsMetadata;
  const constants = asPropertiesArray(meta?.properties, []);
  if (constants.length > 0) {
    const constantsNames = constants.map((p) => p.path).sort().join(",\r\n    ");
    return `//#region Exposed variables
import {
    ${constantsNames}
} from './${variablesFileName}';
//#endregion\r\n`;
  }
  return "";
};

const getResultTypeName = (typeName: string, isAsync: boolean): string | undefined => {
  return isAsync
    ? `Promise<${typeName ?? 'void'}>`
    : !isNullOrWhiteSpace(typeName)
      ? typeName
      : undefined;
};

export const buildCodeEditorEnvironmentAsync = async (args: BuildSourceCodeFilesArgs): Promise<BuildSourceCodeFilesResponse> => {
  const { metadataFetcher, availableConstants, resultType, wrapInTemplate, fileName, directory, environment } = args;
  const response: BuildSourceCodeFilesResponse = {
    template: undefined,
    sourceFiles: [],
  };
  const isFileExists = (fileName: string): boolean => {
    return response.sourceFiles.some((f) => f.filePath === fileName);
  };
  const registerFile = (fileName: string, content: string): void => {
    response.sourceFiles.push({ filePath: fileName, content });
  };

  const constantsMeta = typeof (availableConstants) === 'function'
    ? await availableConstants()
    : availableConstants;
  const properties = await fetchProperties(constantsMeta?.properties ?? []);

  const variablesFileName = getVariablesFileName(fileName);

  const tsBuilder = new TypesBuilder(metadataFetcher, isFileExists, registerFile);
  try {
    const constantsDeclaration = await tsBuilder.buildConstants(properties, { environment });
    if (constantsDeclaration.content && !isEmptyString(constantsDeclaration.content)) {
      registerFile(`/${directory}/${variablesFileName}`, constantsDeclaration.content);
      // const constantsModel = addExtraLib(monaco, constantsDeclaration.content, fileNamesState.exposedVarsPath);
      // addSubscription(constantsModel);
    }
  } catch (error) {
    console.error("Failed to build exposed variables", error);
  }

  // build result type
  let resultTypeName: string = "";
  let localDeclarationsBlock = "";
  if (resultType) {
    if (isObjectType(resultType)) {
      const resultTypeDeclaration = await tsBuilder.buildType(resultType);
      const responseFileName = getResponseFileName(fileName);
      registerFile(`/${directory}/${responseFileName}`, resultTypeDeclaration.content);
      resultTypeName = resultType.name ?? "";

      localDeclarationsBlock = `import { ${resultType.name} } from './${trimSuffix(responseFileName, DTS_EXTENSION)}';\r\n`;
    } else
      if (isEntityType(resultType)) {
        const typeId: ModelTypeIdentifier = { module: resultType.entityModule ?? null, name: resultType.entityType };
        const entityType = await tsBuilder.getEntityType(typeId);
        if (!isDefined(entityType))
          throw new Error(`Failed to get entity type: '${typeId.module}:${typeId.name}'`);

        resultTypeName = `Partial<${entityType.typeName}>`;

        const typesImporter = new TypesImporter();
        typesImporter.import(entityType);
        const importSection = typesImporter.generateImports();

        localDeclarationsBlock = `${importSection}\r\n`;
      } else
        if (isArrayType(resultType)) {
          const typesImporter = new TypesImporter();

          const resultTypeDeclaration = await tsBuilder.buildArrayType(resultType, {
            onUseComplexType: (typeInfo) => {
              typesImporter.import(typeInfo);
            },
          });

          const importSection = typesImporter.generateImports();
          localDeclarationsBlock = importSection
            ? `${importSection}\r\n`
            : "";

          resultTypeName = resultTypeDeclaration.typeName;
        } else
          resultTypeName = resultType.dataType;
  }

  const { useAsyncDeclaration = false, functionName } = args;
  if (wrapInTemplate && !isNullOrWhiteSpace(functionName)) {
    const variablesImportBlock = await getVariablesImportBlock(availableConstants, trimSuffix(variablesFileName, DTS_EXTENSION));
    const finalResultTypeName = getResultTypeName(resultTypeName, useAsyncDeclaration);
    const resultTypeClause = finalResultTypeName ? `: ${finalResultTypeName}` : "";

    let header = [variablesImportBlock, localDeclarationsBlock].filter(isNotNullOrWhiteSpace).join("\r\n");
    if (!isEmptyString(header))
      header += "\r\n";

    const result = (code: string): TextTemplate => makeCodeTemplate`${header}const ${functionName} = ${useAsyncDeclaration ? "async " : ""}()${resultTypeClause} => {
${(c) => c.editable(code)}
};`;
    response.template = result;
  }
  return response;
};
