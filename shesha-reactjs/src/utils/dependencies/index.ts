/* eslint-disable no-console */
/*
export type NestedPropertyPaths<T, Target> = {
  [K in keyof T]:
  T[K] extends Target ? K
    : T[K] extends object ? `${K & string}.${NestedPropertyPaths<T[K], Target>}`
      : never
}[keyof T];
*/
// type Primitive = string | number | boolean | symbol | bigint | null | undefined;

import { ConfigurableItemIdentifier, FormMarkup, IToolboxComponents } from "@/interfaces";
import { convertFormMarkupToFlatStructure, getComponentsFromMarkup, getFromSettingsFromMarkup } from "@/providers/form/utils";
import { isDefined } from "../nullables";

export type NestedPropertyPaths<T, Target> = T extends Target
  ? '' // If the type itself is the target, empty path
  : T extends Array<infer U>
    ? `[${number}]${NestedPropertyPaths<U, Target>}` // Handle arrays
    : T extends object
      ? {
        [K in keyof T]:
        K extends string | number
          ? T[K] extends Target
            ? `${K}` // Direct match
            : T[K] extends object
              ? `${K}.${NestedPropertyPaths<T[K], Target>}` // Nested object
              : never // Primitive that's not our target
          : never
      }[keyof T] extends infer P
        ? P extends string
          ? P
          : never
        : never
      : never; // Not an object, not our target

// Optional: Flatten to get array of paths
export type PathsToArray<T, Target> = NestedPropertyPaths<T, Target> extends string
  ? Array<NestedPropertyPaths<T, Target>>
  : never[];


type ConfigurationItemDependency = ConfigurableItemIdentifier & {
  type: string;
};

export const collectDependencies = (formMarkup: FormMarkup, designerComponents: IToolboxComponents): ConfigurationItemDependency[] => {
  const components = getComponentsFromMarkup(formMarkup);
  const formSettings = getFromSettingsFromMarkup(formMarkup);
  const flatMarkup = convertFormMarkupToFlatStructure(components, formSettings, designerComponents);
  const { allComponents } = flatMarkup;

  for (const id in allComponents) {
    if (allComponents.hasOwnProperty(id)) {
      const component = flatMarkup.allComponents[id];
      console.log('LOG: collectDependencies: ', component);

      for (const propName in component) {
        if (component.hasOwnProperty(propName)) {
          const propValue = component[propName];
          if (isDefined(propValue) && typeof propValue === 'object') {
            /*
            const paths = Object.keys(propValue) as PathsToArray<typeof propValue, string>;
            console.log('LOG: collectDependencies: ', paths);
            */
            console.log('LOG: property value is an object: ', propValue);
          }
        }
      }
    }
  }

  return [];
};
