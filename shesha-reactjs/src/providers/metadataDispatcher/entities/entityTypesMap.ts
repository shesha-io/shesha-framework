import { IEntityTypeIndentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { IEntityTypesMap } from "./models";

type ClassNamesMap = Map<string, IEntityTypeIndentifier>;

export class EntityTypesMap implements IEntityTypesMap {
  #namesMap: ClassNamesMap;

  constructor() {
    this.#namesMap = new Map();
  }

  register = (className: string, accessor: IEntityTypeIndentifier): void => {
    this.#namesMap.set(className, accessor);
  };

  resolve = (className: string): IEntityTypeIndentifier | undefined => {
    return this.#namesMap.get(className);
  };

  clear = (): void => {
    this.#namesMap.clear();
  };
}
