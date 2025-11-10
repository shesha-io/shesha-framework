import { IConfigurableFormComponent, IFlatComponentsStructure } from "@/interfaces";
import { isDefined } from "@/utils/nullables";

export const getComponent = (formFlatMarkup: IFlatComponentsStructure, id: string): IConfigurableFormComponent => {
  const component = formFlatMarkup.allComponents[id];
  if (!isDefined(component))
    throw new Error(`Cannot find component with id ${id}`);
  return component;
};
