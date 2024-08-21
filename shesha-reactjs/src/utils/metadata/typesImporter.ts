import _ from "lodash";
import { TypeAndLocation } from "./models";
import { trimSuffix } from "../string";

export class TypesImporter {
    readonly #imports: Map<string, Set<string>> = new Map<string, Set<string>>();

    import(type: TypeAndLocation){
        if (!type.filePath)
            return;

        const fileImport = this.#imports.get(type.filePath);

        if (!fileImport)
            this.#imports.set(type.filePath, new Set([type.typeName]));
        else
            fileImport.add(type.typeName);
    }

    static cleanupFileNameForImport = (path: string) => {
        return path.endsWith(".d.ts") 
            ? path.startsWith('.') 
                ? path
                : trimSuffix(path, ".d.ts")
            : trimSuffix(path, ".ts");
    };

    generateImports(){
        return Array.from(this.#imports.entries())
            .map(([filePath, types]) => `import { ${Array.from(types).join(', ')} } from '${TypesImporter.cleanupFileNameForImport(filePath)}';`)
            .join('\n');            
    }
}