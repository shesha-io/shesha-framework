import { asPropertiesArray, IObjectMetadata, isPropertiesArray, isPropertiesLoader, ModelTypeIdentifier, NestedProperties, PropertiesPromise } from "@/interfaces/metadata";
import { makeCodeTemplate, TextTemplate } from "./utils";
import { CodeTemplateSettings, isArrayType, isEntityType, isObjectType, ResultType } from "../models";
import { TypesBuilder } from "@/utils/metadata/typesBuilder";
import { isEmptyString, trimSuffix } from "@/utils/string";
import { DTS_EXTENSION, TypesImporter } from "@/utils/metadata/typesImporter";

export interface ISourceCodeFile {
    content: string;
    filePath: string;
}

// isFileExists
export type BuildSourceCodeFilesArgs = {
    wrapInTemplate: boolean;
    fileName: string;
    directory: string;
    availableConstants?: IObjectMetadata;
    templateSettings?: CodeTemplateSettings;
    resultType?: ResultType;
    metadataFetcher: (typeId: ModelTypeIdentifier) => Promise<IObjectMetadata>;
};
export type BuildSourceCodeFilesResponse = {
    template: (code: string) => TextTemplate;
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

const getVariablesImportBlock = (constantsMetadata: IObjectMetadata, variablesFileName: string): string => {
    const constants = asPropertiesArray(constantsMetadata?.properties, []);
    if (constants.length > 0) {
        const constantsNames = constants.map(p => p.path).sort().join(",\r\n    ");
        return `//#region Exposed variables
import {
    ${constantsNames}
} from './${variablesFileName}';
//#endregion\r\n`;
    }
    return "";
};

const getResultTypeName = (typeName: string, isAsync: boolean) => {
    return isAsync
        ? `Promise<${typeName ?? 'void'}>`
        : Boolean(typeName)
            ? typeName
            : undefined;
};

export const buildCodeEditorEnvironmentAsync = async (args: BuildSourceCodeFilesArgs): Promise<BuildSourceCodeFilesResponse> => {
    const { metadataFetcher, availableConstants, resultType, wrapInTemplate, fileName, directory } = args;
    const response: BuildSourceCodeFilesResponse = {
        template: undefined,
        sourceFiles: []
    };
    const isFileExists = (fileName: string): boolean => {
        return response.sourceFiles.some(f => f.filePath === fileName);
    };
    const registerFile = (fileName: string, content: string) => {
        response.sourceFiles.push({ filePath: fileName, content });
    };

    const properties = await fetchProperties(availableConstants?.properties ?? []);;

    const variablesFileName = getVariablesFileName(fileName);

    const tsBuilder = new TypesBuilder(metadataFetcher, isFileExists, registerFile);
    // build exposed variables
    try {
        const constantsDeclaration = await tsBuilder.buildConstants(properties);
        if (constantsDeclaration.content && !isEmptyString(constantsDeclaration.content)) {
            registerFile(`/${directory}/${variablesFileName}`, constantsDeclaration.content);
            //const constantsModel = addExtraLib(monaco, constantsDeclaration.content, fileNamesState.exposedVarsPath);
            //addSubscription(constantsModel);
        }
    } catch (error) {
        console.error("Failed to build exposed variables", error);
    }

    // build result type
    let resultTypeName: string = null;
    let localDeclarationsBlock = "";
    if (resultType) {
        if (isObjectType(resultType)) {
            const resultTypeDeclaration = await tsBuilder.buildType(resultType);
            const responseFileName = getResponseFileName(fileName);
            registerFile(`/${directory}/${responseFileName}`, resultTypeDeclaration.content);
            resultTypeName = resultType.name;

            localDeclarationsBlock = `import { ${resultType.name} } from './${trimSuffix(responseFileName, DTS_EXTENSION)}';\r\n`;
        } else
            if (isEntityType(resultType)) {
                const entityType = await tsBuilder.getEntityType({ module: resultType.entityModule, name: resultType.entityType });
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
                        }
                    });

                    const importSection = typesImporter.generateImports();
                    localDeclarationsBlock = importSection
                        ? `${importSection}\r\n`
                        : undefined;

                    resultTypeName = resultTypeDeclaration.typeName;
                } else
                    resultTypeName = resultType.dataType;
    }

    if (wrapInTemplate) {
        const { useAsyncDeclaration, functionName } = args.templateSettings;

        const variablesImportBlock = getVariablesImportBlock(availableConstants, trimSuffix(variablesFileName, DTS_EXTENSION));
        const finalResultTypeName = getResultTypeName(resultTypeName, useAsyncDeclaration);
        const resultTypeClause = finalResultTypeName ? `: ${finalResultTypeName}` : "";

        let header = [variablesImportBlock, localDeclarationsBlock].filter(b => b && !isEmptyString(b)).join("\r\n");
        if (!isEmptyString(header))
            header += "\r\n";

        const result = (code) => makeCodeTemplate`${header}const ${functionName} = ${useAsyncDeclaration ? "async " : ""}()${resultTypeClause} => {
${(c) => c.editable(code)}
};`;
        response.template = result;
    }
    return response;
};