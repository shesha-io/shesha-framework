import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";

export interface ComponentTypeInfo {
  isDataTableContext: boolean;
  isInput: boolean;
  shouldSkip: boolean;
}

const componentsToSkip = ['attachmentsEditor', 'checkbox']
export const getComponentTypeInfo = (component: IToolboxComponent<IConfigurableFormComponent>): ComponentTypeInfo => {
  const isDataTableContext = component?.type === 'datatableContext';
  const isInput = component?.isInput || component?.type === 'button';
  const shouldSkip = componentsToSkip.includes(component?.type);

  return {
    isDataTableContext,
    isInput,
    shouldSkip,
  };
};
