import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface ISliderComponentPropsV0 extends IConfigurableFormComponent {
  min?: string;
  max?: string;
}

export interface ISliderComponentProps extends IConfigurableFormComponent {
  min?: number;
  max?: number;
}

export type SliderComponentDefinition = ComponentDefinition<"slider", ISliderComponentProps>;
