import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IContainerCheckerComponentProps extends IConfigurableFormComponent {
  components?: IConfigurableFormComponent[];
}

export type ContainerCheckerComponentDefinition = ComponentDefinition<"containerChecker", IContainerCheckerComponentProps>;
