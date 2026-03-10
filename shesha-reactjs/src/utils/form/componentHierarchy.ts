import { IFlatComponentsStructure, IConfigurableFormComponent } from '@/providers/form/models';

/**
 * Type guard to check if a component is IConfigurableFormComponent (has type property)
 */
const isConfigurableFormComponent = (component: any): component is IConfigurableFormComponent => {
  return component && typeof component === 'object' && 'type' in component;
};

/**
 * Check if a component is placed inside a parent component of a specific type
 * by traversing the component hierarchy in the form markup
 */
export const isComponentInsideParentOfType = (
  componentId: string,
  parentType: string,
  flatStructure?: IFlatComponentsStructure,
): boolean => {
  if (!flatStructure || !componentId) return false;

  const { allComponents, componentRelations } = flatStructure;

  // Find parent by checking all componentRelations
  for (const [parentId, children] of Object.entries(componentRelations)) {
    if (children?.includes(componentId)) {
      const parent = allComponents[parentId];

      // Check if this parent matches the type (only for IConfigurableFormComponent)
      if (parent && isConfigurableFormComponent(parent) && parent.type === parentType) {
        return true;
      }

      // Recursively check if this parent is inside the target type
      if (isComponentInsideParentOfType(parentId, parentType, flatStructure)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if a component is placed inside a DataContext component
 */
export const isInsideDataContext = (componentId: string, flatStructure?: IFlatComponentsStructure): boolean => {
  return isComponentInsideParentOfType(componentId, 'dataContext', flatStructure);
};
