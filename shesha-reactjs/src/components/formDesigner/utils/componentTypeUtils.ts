import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
import { COMPONENTS_TO_SKIP, SkipComponentType } from "./designerConstants";

export interface ComponentTypeInfo {
  isInput: boolean;
  shouldSkip: boolean;
}

/**
 * Checks if a component type should skip standard dimension processing.
 *
 * @param componentType - The component type to check
 * @returns true if the component should skip standard dimension processing
 *
 * @example
 * ```tsx
 * if (shouldSkipComponent('checkbox')) {
 *   // Apply special handling for checkbox
 * }
 * ```
 */
export const shouldSkipComponent = (componentType: string | undefined): boolean => {
  if (!componentType) return false;
  return COMPONENTS_TO_SKIP.includes(componentType as SkipComponentType);
};

/**
 * Gets component type classification information.
 *
 * Used to determine how a component should be rendered in the designer:
 * - isInput: Whether the component is an input field (affects default margins)
 * - shouldSkip: Whether to skip standard dimension wrapper pattern
 *
 * @param component - The toolbox component definition
 * @returns ComponentTypeInfo with classification flags
 *
 * @example
 * ```tsx
 * const typeInfo = getComponentTypeInfo(toolboxComponent);
 * if (typeInfo.shouldSkip) {
 *   return dimensionsStyles; // Use original dimensions
 * }
 * return { width: '100%', height: '100%' }; // Fill wrapper
 * ```
 */
export const getComponentTypeInfo = (component: IToolboxComponent<IConfigurableFormComponent>): ComponentTypeInfo => {
  const isInput = component?.isInput || component?.type === 'button';
  const shouldSkip = shouldSkipComponent(component?.type);

  return {
    isInput,
    shouldSkip,
  };
};
