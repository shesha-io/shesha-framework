import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IStyleBoxComponentProps extends IConfigurableFormComponent {
  noMargin?: boolean;
}

export interface IInputDirection {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export interface IValue {
  padding?: IInputDirection;
  margin?: IInputDirection;
}

export type StyleBoxDefinition = ComponentDefinition<"styleBox", IStyleBoxComponentProps>;
