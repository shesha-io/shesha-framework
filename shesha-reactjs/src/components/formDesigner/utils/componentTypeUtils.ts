import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
import { COMPONENTS_WITH_CUSTOM_DIMENSIONS, CustomDimensionComponentType } from "./designerConstants";

export interface ComponentTypeInfo {
  isInput: boolean;
  /** Whether to preserve original dimensions instead of using 100% fill in designer mode */
  shouldPreserveDimensions: boolean;
}

/**
 * Checks if a component type should preserve its original dimensions.
 *
 * Components with custom dimensions (like checkbox, attachmentsEditor) manage
 * their own sizing and should not be forced to fill 100% of their wrapper
 * in designer mode.
 *
 * @param componentType - The component type to check
 * @returns true if the component should preserve its original dimensions
 *
 * @example
 * ```tsx
 * if (shouldPreserveOriginalDimensions('checkbox')) {
 *   // Use the component's original dimensions
 * }
 * ```
 */
export const shouldPreserveOriginalDimensions = (componentType: string | undefined): boolean => {
  if (!componentType) return false;
  return COMPONENTS_WITH_CUSTOM_DIMENSIONS.includes(componentType as CustomDimensionComponentType);
};

/**
 * Gets component type classification information.
 *
 * Used to determine how a component should be rendered in the designer:
 * - isInput: Whether the component is an input field (affects default margins)
 * - shouldPreserveDimensions: Whether to preserve original dimensions instead of 100% fill
 *
 * @param component - The toolbox component definition
 * @returns ComponentTypeInfo with classification flags
 *
 * @example
 * ```tsx
 * const typeInfo = getComponentTypeInfo(toolboxComponent);
 * if (typeInfo.shouldPreserveDimensions) {
 *   return dimensionsStyles; // Use original dimensions
 * }
 * return { width: '100%', height: '100%' }; // Fill wrapper
 * ```
 */
export const getComponentTypeInfo = (component: IToolboxComponent<IConfigurableFormComponent>): ComponentTypeInfo => {
  const isInput = component?.isInput || component?.type === 'button';
  const shouldPreserveDimensions = shouldPreserveOriginalDimensions(component?.type);

  return {
    isInput,
    shouldPreserveDimensions,
  };
};
