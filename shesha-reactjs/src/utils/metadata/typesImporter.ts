import _ from "lodash";
import { EOL, TypeAndLocation } from "./models";
import { trimSuffix } from "../string";
import { TypeImport } from "@/interfaces/metadata";

export const DTS_EXTENSION = '.d.ts';

export class TypesImporter {
  readonly #imports: Map<string, Set<string>> = new Map<string, Set<string>>();

  import(type: TypeAndLocation): void {
    if (!type.filePath)
      return;

    const fileImport = this.#imports.get(type.filePath);

    if (!fileImport)
      this.#imports.set(type.filePath, new Set([type.typeName]));
    else
      fileImport.add(type.typeName);
  }

  importAll(types?: TypeImport[]): void {
    if (types)
      types.forEach((type) => this.import(type));
  }

  static cleanupFileNameForImport = (path: string): string => {
    return path.endsWith(DTS_EXTENSION)
      ? path.startsWith('.')
        ? path
        : trimSuffix(path, DTS_EXTENSION)
      : trimSuffix(path, ".ts");
  };

  generateImports(): string {
    return Array.from(this.#imports.entries())
      .map(([filePath, types]) => `import { ${Array.from(types).join(', ')} } from '${TypesImporter.cleanupFileNameForImport(filePath)}';`)
      .join(EOL);
  }
}
