import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';

export interface IButtonComponentProps extends Omit<IButtonItem, "readOnly">, IConfigurableFormComponent, Omit<IStyleValue, 'style'> { }
