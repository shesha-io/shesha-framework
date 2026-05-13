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
  category?: 'inputComponents' | 'layoutComponents' | 'standardComponents' | 'inlineComponents';
}

// Lazy initialization to avoid circular dependency
let cachedMenuItems: IMenuItem[] | null = null;

const buildComponentItems = (): IMenuItem[] => {
  return getToolboxComponents(false, { formId: null, formProps: null }).filter(group => group.visible).map(
    (componentGroup) => ({
      key: componentGroup.name,
      title: componentGroup.name,
      children: componentGroup.components.map((component) => ({
        key: component.type,
        title: component.name,
        type: component.type,
        icon: component.icon,
      })),
    })
  );
};

export const getMenuItems = (): IMenuItem[] => {
  if (!cachedMenuItems) {
    cachedMenuItems = buildComponentItems();
  }
  return cachedMenuItems;
};

// Hierarchical component structure used for building the navigation menu
export const MENU_ITEMS: IMenuItem[] = new Proxy([] as IMenuItem[], {
  get(_target, prop) {
    const items = getMenuItems();
    return Reflect.get(items, prop, items);
  },
  has(_target, prop) {
    const items = getMenuItems();
    return Reflect.has(items, prop);
  },
  ownKeys() {
    const items = getMenuItems();
    return Reflect.ownKeys(items);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const items = getMenuItems();
    return Reflect.getOwnPropertyDescriptor(items, prop);
  },
});

/**
 * Find a component node by its key in the component hierarchy
 */
export const findComponentNode = (key: string, items?: IMenuItem[]): IMenuItem | null => {
  const searchitems = items ?? getMenuItems();
  for (const node of searchitems) {
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
  const searchitems = items ?? getMenuItems();
  const result: IMenuItem[] = [];
  for (const node of searchitems) {
    if (node.type) {
      result.push(node);
    }
    if (node.children) {
      result.push(...getAllComponentTypes(node.children));
    }
  }
  return result;
};
