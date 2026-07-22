import { ITypeDefinitionLoadingContext, SourceFile, TypeDefinition } from "@/interfaces";
import { IComponentApiDescription } from "./model";
import { StringBuilder, TypesImporter } from "@/utils";
import { EOL } from "@/utils/metadata/models";

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
    const files = component.typeDefinition?.files ?? [];
    if (component.typeDefinition?.typeName && files[0]?.fileName) {
      typesImporter.import({ typeName: component.typeDefinition.typeName, filePath: files[0].fileName });
      files.forEach((file) => {
        if (processedFiles.has(file.fileName)) return;
        processedFiles.add(file.fileName);
        context.typeDefinitionBuilder.makeFile(file.fileName, file.content);
      });
      if (component.typeDefinition.isNullable || makeComponentsNullable)
        sb.append(`/** Please note: the component may be unavailable (undefined) during initialization of the form. */`);
      const componentName = `${component.componentName}${component.typeDefinition.isNullable || makeComponentsNullable ? "?" : ""}`;
      const componentType = `${component.typeDefinition.typeName}${component.typeDefinition.isNullable || makeComponentsNullable ? " | undefined" : ""}`;
      sb.append(`readonly ${componentName}: ${componentType};`);
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
