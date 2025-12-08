import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface ISliderComponentProps extends IConfigurableFormComponent {
  min?: string;
  max?: string;
}

export type SliderComponentDefinition = ComponentDefinition<"slider", ISliderComponentProps>;
