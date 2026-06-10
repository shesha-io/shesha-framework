/**
 * Component hierarchy structure for the Components Settings screen
 * Maps component categories to individual component types
 * Used to build the navigation menu for component appearance settings
 */

import React from 'react';
import { getToolboxComponents } from "@/providers/form/defaults/toolboxComponents";
import { IToolboxComponent } from '@/interfaces';
import { hasAppearanceSettings } from './appearanceMarkup';

export interface IMenuItem {
  key: string;
  title: string;
  icon?: React.ReactNode;
  type?: string; // The actual component type identifier (e.g., 'button', 'textField')
  children?: IMenuItem[];
}

/**
 * Component types that are draggable designer components but should NOT appear in the Component
 * Defaults / theming panel. These are data-orchestration, context, or table-internal controls that
 * have no meaningful "default appearance" to preview in isolation (they only render against a bound
 * data source or as part of a parent table/list). Filtering them keeps the panel focused on
 * components whose default styling a user can actually see and configure.
 */
const EXCLUDED_COMPONENT_TYPES = new Set<string>([
  // Data context / orchestration
  'dataContext', // Data Context (new)
  'datatableContext', // Data Context (legacy)
  'dataSource',
  'childTable',
  'datatable.selectColumnsButton',
  // Containers that host other forms/views (nothing to style by default)
  'subForm',
  'dynamicView',
  // Non-visual / validation helpers
  'validationErrors',
]);
// Note: `datatable` and `datalist` are intentionally NOT excluded — the preview wraps them in a Data
// Context bound to the seeded Shesha.Core.DummyTable (see buildPreviewComponents) so they render the
// same sample rows the designer shows, letting users style them with realistic content.

/**
 * Whether a toolbox component should be offered for theming in the Component Defaults panel.
 * A component qualifies when it is a real, visible designer component that is not explicitly
 * excluded and exposes an Appearance tab in its settings (i.e. it is actually styleable).
 */
const isStyleableComponent = (component: IToolboxComponent): boolean => {
  if (!component?.type) return false;
  if (component.isHidden) return false;
  if (EXCLUDED_COMPONENT_TYPES.has(component.type)) return false;
  return hasAppearanceSettings(component.type);
};

// Lazy initialization to avoid circular dependency
let cachedMenuItems: IMenuItem[] | null = null;

const buildComponentItems = (): IMenuItem[] => {
  const toolboxComponents = getToolboxComponents(false, { formId: null, formProps: null });

  return toolboxComponents
    .filter((group) => group.visible)
    .map((componentGroup) => ({
      key: componentGroup.name,
      title: componentGroup.name,
      children: componentGroup.components
        .filter(isStyleableComponent)
        .map((component) => ({
          key: component.type,
          title: component.name,
          type: component.type,
          icon: component.icon,
        })),
    }))
    // Drop groups left empty after filtering so the menu has no blank categories.
    .filter((group) => group.children.length > 0);
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
