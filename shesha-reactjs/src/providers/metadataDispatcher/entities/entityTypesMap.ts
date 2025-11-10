import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { IEntityTypesMap } from "./models";

type ClassNamesMap = Map<string, IEntityTypeIdentifier>;

export class EntityTypesMap implements IEntityTypesMap {
  #namesMap: ClassNamesMap;

  constructor() {
    this.#namesMap = new Map();
  }

  register = (className: string, accessor: IEntityTypeIdentifier): void => {
    this.#namesMap.set(className, accessor);
  };

  resolve = (className: string): IEntityTypeIdentifier | undefined => {
    return this.#namesMap.get(className);
  };

  identifierExists = (model: IEntityTypeIdentifier): boolean => {
    return Array.from(this.#namesMap.values()).some((m) => {
      return m.name === model.name && m.module === model.module;
    });
  };

  clear = (): void => {
    this.#namesMap.clear();
  };
}
