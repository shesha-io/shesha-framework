/**
 * Component hierarchy structure for the Components Settings screen
 * Maps component categories to individual component types
 * Used to build the navigation menu for component appearance settings
 */

import React from 'react';
import { getToolboxComponents } from "@/providers/form/defaults/toolboxComponents";

export interface IMenuItem {
  key: string;
  title: string;
  icon?: React.ReactNode;
  type?: string; // The actual component type identifier (e.g., 'button', 'textField')
  children?: IMenuItem[];
}

// Lazy initialization to avoid circular dependency
let cachedMenuItems: IMenuItem[] | null = null;

const buildComponentItems = (): IMenuItem[] => {
  const toolboxComponents = getToolboxComponents(false, { formId: null, formProps: null });

  return toolboxComponents
    .filter((group) => group.visible)
    .map((componentGroup) => ({
      key: componentGroup.name,
      title: componentGroup.name,
      children: componentGroup.components.map((component) => ({
        key: component.type,
        title: component.name,
        type: component.type,
        icon: component.icon,
      })),
    }));
};

export const getMenuItems = (): IMenuItem[] => {
  if (!cachedMenuItems) {
    cachedMenuItems = buildComponentItems();
  }
  return cachedMenuItems;
};

/**
 * Find a component node by its key in the component hierarchy
 */
export const findComponentNode = (key: string, items?: IMenuItem[]): IMenuItem | null => {
  const searchItems = items ?? getMenuItems();
  for (const node of searchItems) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findComponentNode(key, node.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get all component types (individual components, not categories)
 */
export const getAllComponentTypes = (items?: IMenuItem[]): IMenuItem[] => {
  const searchItems = items ?? getMenuItems();
  const result: IMenuItem[] = [];
  for (const node of searchItems) {
    if (node.type) {
      result.push(node);
    }
    if (node.children) {
      result.push(...getAllComponentTypes(node.children));
    }
  }
  return result;
};
