import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEventHandlers } from '@/components/formDesigner/components/utils';
import { ComponentDefinition } from '@/interfaces';

export interface IColorPickerComponentProps extends IConfigurableFormComponent {
  title?: string;
  allowClear?: boolean;
  showText?: boolean;
  disabledAlpha?: boolean;
  tooltip?: string;
  stylingBox?: string;
}

interface IColorPickerComopnentCalulatedValues {
  eventHandlers: IEventHandlers;
}

export type ColorPickerComponentDefinition = ComponentDefinition<"colorPicker", IColorPickerComponentProps, IColorPickerComopnentCalulatedValues>;
