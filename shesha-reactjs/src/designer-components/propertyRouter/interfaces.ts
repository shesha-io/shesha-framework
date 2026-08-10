import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IPropertySetting } from '@/providers/form/models';

export interface IPropertyRouterComponentProps extends IConfigurableFormComponent {
  propertyRouteName?: string | IPropertySetting<string> | undefined;
  components?: IConfigurableFormComponent[];
}

export type PropertyRouterComponentDefinition = ComponentDefinition<"propertyRouter", IPropertyRouterComponentProps>;
