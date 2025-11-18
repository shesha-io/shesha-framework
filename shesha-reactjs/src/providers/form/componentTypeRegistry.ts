/**
 * Component Type Registry
 *
 * This module provides infrastructure for handling component type aliases and deprecations.
 * Components declare deprecated type names via the `replacesTypes` property, and the aliases
 * are automatically registered when components are loaded.
 */

const componentTypeAliases: Record<string, string> = {};

/**
 * Register a component type alias (deprecated type -> current type mapping)
 * This is automatically called when components with replacesTypes are loaded.
 * @param deprecatedType - The old/deprecated component type
 * @param currentType - The current component type
 */
export const registerComponentTypeAlias = (deprecatedType: string, currentType: string): void => {
  componentTypeAliases[deprecatedType] = currentType;
};

/**
 * Get the current component type for a given type (resolves aliases)
 * @param type - The component type (may be deprecated)
 * @returns The current component type
 */
export const resolveComponentType = (type: string): string => {
  return componentTypeAliases[type] || type;
};

/**
 * Check if a component type is deprecated
 * @param type - The component type to check
 * @returns true if the type is deprecated, false otherwise
 */
export const isDeprecatedComponentType = (type: string): boolean => {
  return type in componentTypeAliases;
};

/**
 * Get all registered aliases
 * @returns Record of deprecated types to current types
 */
export const getComponentTypeAliases = (): Readonly<Record<string, string>> => {
  return Object.freeze({ ...componentTypeAliases });
};
