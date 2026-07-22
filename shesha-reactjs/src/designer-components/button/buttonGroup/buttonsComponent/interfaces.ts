import { ComponentDefinition, IConfigurableFormComponent } from '@/interfaces';
import { IToolbarSettingsModal } from '../../../../components/buttonGroupConfigurator';

export interface IButtonsProps extends Omit<IToolbarSettingsModal, 'readOnly'>, IConfigurableFormComponent {}

export type ButtonsComponentDefinition = ComponentDefinition<"buttons", IButtonsProps>;
