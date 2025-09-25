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
