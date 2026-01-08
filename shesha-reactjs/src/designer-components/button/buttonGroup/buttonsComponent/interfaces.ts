import { IConfigurableFormComponent } from '@/interfaces';
import { IToolbarSettingsModal } from '../../../../components/buttonGroupConfigurator';

export interface IButtonsProps extends Omit<IToolbarSettingsModal, 'readOnly'>, IConfigurableFormComponent {
    title?: string;
    caption?: string;
    readOnlyCaption?: string;
}