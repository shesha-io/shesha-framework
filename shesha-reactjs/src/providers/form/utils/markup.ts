import { IToolboxComponentBase, IToolboxComponentGroup } from "@/interfaces";
import { isDefined } from "@/utils/nullables";

/**
 * Finds the first toolbox component that matches the given predicate.
 *
 * @param availableComponents The list of available toolbox components groups.
 * @param predicate A function that takes a toolbox component and returns a boolean value.
 * @returns The first toolbox component that matches the given predicate, or undefined if no match is found.
 */
export const findToolboxComponent = (
  availableComponents: IToolboxComponentGroup[],
  predicate: (component: IToolboxComponentBase) => boolean,
): IToolboxComponentBase | undefined => {
  for (const group of availableComponents) {
    for (const component of group.components) {
      if (predicate(component)) return component;
    }
  }

  return undefined;
};


/**
 * Retrieves the first toolbox component that matches the given predicate.
 * If no match is found, an error is thrown.
 * @throws {Error} If no component is found.
 * @param {IToolboxComponentGroup[]} availableComponents The list of available toolbox components groups.
 * @param {(component: IToolboxComponent) => boolean} predicate A function that takes a toolbox component and returns a boolean value.
 * @returns {IToolboxComponent} The first toolbox component that matches the given predicate.
 */
export const getToolboxComponent = (
  availableComponents: IToolboxComponentGroup[],
  predicate: (component: IToolboxComponentBase) => boolean,
): IToolboxComponentBase => {
  const component = findToolboxComponent(availableComponents, predicate);
  if (!isDefined(component))
    throw new Error('Component not found');
  return component;
};
