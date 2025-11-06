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

  identifierExists = (model: IEntityTypeIndentifier): boolean => {
    return this.#namesMap.values().some((m) => {
      return m.name === model.name && m.module === model.module;
    });
  };

  clear = (): void => {
    this.#namesMap.clear();
  };
}
