import { ComponentDefinition, IConfigurableFormComponent } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/providers';
import { IPropertyMetadata } from '@/interfaces/metadata';

export interface IDataContextComponentProps extends IConfigurableFormComponent {
  items: IPropertyMetadata[];
  initialDataCode: string;
  onChangeAction?: IConfigurableActionConfiguration;
}

export type DataContextComponentDefinition = ComponentDefinition<"dataContext", IDataContextComponentProps>;
