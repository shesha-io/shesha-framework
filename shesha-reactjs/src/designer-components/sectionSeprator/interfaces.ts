import { IConfigurableFormComponent } from '@/providers/form/models';
import { IFontValue } from '../_settings/utils/font/interfaces';

export interface ISectionSeparatorComponentProps extends IConfigurableFormComponent {
    containerStyle?: string;
    titleStyle?: string;
    lineFont?: IFontValue;
    font?: IFontValue;
}