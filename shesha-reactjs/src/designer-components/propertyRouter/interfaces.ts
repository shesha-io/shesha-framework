import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

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

export interface IPropertyRouterComponent extends IConfigurableFormComponent {
  propertyRouteName?: string;
  components?: IConfigurableFormComponent[];
}

export type PropertyRouterComponentDefinition = IToolboxComponent<IPropertyRouterComponent>;
