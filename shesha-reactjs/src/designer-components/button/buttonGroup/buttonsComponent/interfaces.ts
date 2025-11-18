import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { IToolbarSettingsModal } from '../../../../components/buttonGroupConfigurator';

export interface IButtonsProps extends Omit<IToolbarSettingsModal, 'readOnly'>, IConfigurableFormComponent {}

export type ButtonsComponentDefinition = IToolboxComponent<IButtonsProps>;
