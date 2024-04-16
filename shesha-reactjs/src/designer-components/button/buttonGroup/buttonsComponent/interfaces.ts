import { IConfigurableFormComponent } from '@/interfaces';
import { IToolbarSettingsModal } from '../buttonGroupSettingsModal';

export interface IButtonsProps extends Omit<IToolbarSettingsModal, 'readOnly'>, IConfigurableFormComponent {}