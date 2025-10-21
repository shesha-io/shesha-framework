export interface ComponentTypeInfo {
  isDataTableContext: boolean;
  isInput: boolean;
}

export const getComponentTypeInfo = (component: any): ComponentTypeInfo => {
  const isDataTableContext = component?.type === 'datatableContext';
  const isInput = component?.isInput || component?.type === 'button';

  return {
    isDataTableContext,
    isInput,
  };
};
