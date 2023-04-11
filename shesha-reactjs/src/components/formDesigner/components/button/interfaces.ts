import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { IButtonGroupButton } from '../../../../providers/buttonGroupConfigurator/models';

export interface IButtonComponentProps extends IButtonGroupButton, IConfigurableFormComponent {}