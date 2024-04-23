import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IStyleBoxComponentProps extends IConfigurableFormComponent {}

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
