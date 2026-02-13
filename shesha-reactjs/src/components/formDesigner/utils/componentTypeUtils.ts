import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";

export interface ComponentTypeInfo {
  isInput: boolean;
  /** Whether to preserve original dimensions instead of using 100% fill in designer mode */
  preserveDimensionsInDesigner: boolean;
}

/**
 * Gets component type classification information.
 *
 * Used to determine how a component should be rendered in the designer:
 * - isInput: Whether the component is an input field (affects default margins)
 * - preserveDimensionsInDesigner: Whether to preserve original dimensions instead of 100% fill
 *
 * @param component - The toolbox component definition
 * @returns ComponentTypeInfo with classification flags
 *
 * @example
 * ```tsx
 * const typeInfo = getComponentTypeInfo(toolboxComponent);
 * if (typeInfo.preserveDimensionsInDesigner) {
 *   return dimensionsStyles; // Use original dimensions
 * }
 * return { width: '100%', height: '100%' }; // Fill wrapper
 * ```
 */
export const getComponentTypeInfo = (component: IToolboxComponent<IConfigurableFormComponent> | undefined): ComponentTypeInfo => {
  const isInput = component?.isInput || component?.type === 'button';
  const preserveDimensionsInDesigner = component?.preserveDimensionsInDesigner ?? false;

  return {
    isInput,
    preserveDimensionsInDesigner,
  };
};
