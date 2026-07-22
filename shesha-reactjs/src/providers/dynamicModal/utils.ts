import { IModalInstance } from "./models";

export const getLatestInstance = (instances: { [index: string]: IModalInstance }, predicate: (instance: IModalInstance) => boolean): IModalInstance | undefined => {
  let highestInstance: IModalInstance | undefined = undefined;

  for (const key of Object.keys(instances)) {
    const instance = instances[key];
    if (instance && predicate(instance) && (highestInstance === undefined || instance.index > highestInstance.index))
      highestInstance = instance;
  }
  return highestInstance;
};
