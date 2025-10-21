import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";

export interface ComponentTypeInfo {
  isDataTableContext: boolean;
  isInput: boolean;
}

export const getComponentTypeInfo = (component: IToolboxComponent<IConfigurableFormComponent>): ComponentTypeInfo => {
  const isDataTableContext = component?.type === 'datatableContext';
  const isInput = component?.isInput || component?.type === 'button';

  return {
    isDataTableContext,
    isInput,
  };
};
