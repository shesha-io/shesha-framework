import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { ButtonType } from 'antd/es/button';

export interface IButtonStyleValue extends IStyleValue {
  buttonType?: ButtonType | 'ghost' | undefined;
}

export interface IButtonComponentProps extends Omit<IButtonItem, "readOnly" | "editMode" | "hidden">, IConfigurableFormComponent<IButtonStyleValue>, Omit<IButtonStyleValue, 'style'> { }
