import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";

export interface ComponentTypeInfo {
  isInput: boolean;
  shouldSkip: boolean;
}

const componentsToSkip = ['attachmentsEditor', 'checkbox', 'datatableContext'];
export const getComponentTypeInfo = (component: IToolboxComponent<IConfigurableFormComponent>): ComponentTypeInfo => {
  const isInput = component?.isInput || component?.type === 'button';
  const shouldSkip = componentsToSkip.includes(component?.type);

  return {
    isInput,
    shouldSkip,
  };
};
