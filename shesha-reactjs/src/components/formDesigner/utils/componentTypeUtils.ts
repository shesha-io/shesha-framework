export interface ComponentTypeInfo {
  isDataTableContext: boolean;
  isInput: boolean;
}

export const getComponentTypeInfo = (component: any): ComponentTypeInfo => {
  const isDataTableContext = component?.type === 'datatableContext';
  const isInput = component?.isInput;

  return {
    isDataTableContext,
    isInput
  };
};