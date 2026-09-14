import { ITypeDefinitionLoadingContext, SourceFile, TypeDefinition } from "@/interfaces";
import { IComponentApiDescription } from "./model";
import { isDefined, isNullOrWhiteSpace, StringBuilder, TypesImporter } from "@/utils";
import { EOL } from "@/utils/metadata/models";
import { isNonEmptyArray } from "@/utils/array";

export const componentsToTypeDefinition = (components: IComponentApiDescription<Record<string, unknown>>[], context: ITypeDefinitionLoadingContext, makeComponentsNullable: boolean): Promise<TypeDefinition> => {
  const apiFile: SourceFile = {
    fileName: "apis/components.d.ts",
    content: "",
  };
  const result: TypeDefinition = {
    typeName: "Components",
    files: [apiFile],
  };

  const typesImporter = new TypesImporter();
  const sb = new StringBuilder();
  const processedFiles = new Set<string>();

  sb.append(`export interface Components {`);
  sb.incIndent();

  components.forEach((component) => {
    if (isDefined(component.typeDefinition) &&
      !isNullOrWhiteSpace(component.typeDefinition.typeName) &&
      isNonEmptyArray(component.typeDefinition.files)
    ) {
      const files = component.typeDefinition.files;
      const fileName = files[0].fileName;
      if (!isNullOrWhiteSpace(fileName)) {
        typesImporter.import({ typeName: component.typeDefinition.typeName, filePath: fileName });
        files.forEach((file) => {
          if (!isNullOrWhiteSpace(file.fileName) && !processedFiles.has(file.fileName)) {
            processedFiles.add(file.fileName);
            context.typeDefinitionBuilder.makeFile(file.fileName, file.content);
          }
        });
        const { isNullable = false } = component.typeDefinition;
        if (isNullable || makeComponentsNullable)
          sb.append(`/** Please note: the component may be unavailable (undefined) during initialization of the form. */`);
        const componentName = `${component.componentName}${isNullable || makeComponentsNullable ? "?" : ""}`;
        const componentType = `${component.typeDefinition.typeName}${isNullable || makeComponentsNullable ? " | undefined" : ""}`;
        sb.append(`readonly ${componentName}: ${componentType};`);
      }
    }
  });
  sb.decIndent();
  sb.append(`}`);

  const exportSection = sb.build();
  const importSection = typesImporter.generateImports();

  apiFile.content = `${importSection}${EOL}${exportSection}`;

  context.typeDefinitionBuilder.makeFile("apis/components.d.ts", apiFile.content);

  return Promise.resolve(result);
};
