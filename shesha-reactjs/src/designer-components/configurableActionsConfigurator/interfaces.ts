import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IConfigurableActionConfiguratorComponentProps extends IConfigurableFormComponent {
  allowedActions?: string[];
}

export type ConfigurableActionConfiguratorComponentDefinition = IToolboxComponent<IConfigurableActionConfiguratorComponentProps>;
