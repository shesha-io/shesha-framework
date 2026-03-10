import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';

/** @deprecated Use ISliderComponentProps instead */
export interface ISliderComponentPropsV0 extends IConfigurableFormComponent {
  /** @deprecated legacy (string min/max). Use ISliderComponentProps (number min/max). */
  min?: string;
  /** @deprecated legacy (string min/max). Use ISliderComponentProps (number min/max). */
  max?: string;
}

export interface ISliderComponentProps extends IConfigurableFormComponent {
  min?: number;
  max?: number;
}

export type SliderComponentDefinition = ComponentDefinition<"slider", ISliderComponentProps>;
