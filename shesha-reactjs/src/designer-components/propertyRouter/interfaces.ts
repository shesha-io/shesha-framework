import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IPropertySetting } from '@/providers/form/models';

interface IPropertyRouterContent {
  components: IConfigurableFormComponent[];
  id: string;
}


// update interface before pushing
export interface IPropertyRouterProps extends IConfigurableFormComponent {
  content?: IPropertyRouterContent;
  components?: IConfigurableFormComponent[];
  propertyRouteName?: any;
}

export interface IPropertyRouterComponentProps extends IConfigurableFormComponent {
  propertyRouteName?: string | IPropertySetting<string> | undefined;
  components?: IConfigurableFormComponent[];
}

export type PropertyRouterComponentDefinition = ComponentDefinition<"propertyRouter", IPropertyRouterComponentProps>;
