import { CSSProperties } from 'react';
import { ShaIconTypes } from '@/components/iconPicker';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

/**
 * The pre-refactor shape. Appearance was configured through flat, single-purpose properties
 * (`fontSize`, `color`, `borderWidth`, …) rather than the standard style panels. Kept so the
 * migrator steps that consume those properties stay type-safe — new code should use
 * {@link IIconPickerComponentProps}.
 */
export interface IIconPickerComponentPropsV1 extends IConfigurableFormComponent, IInputStyles {
  fontSize?: number | undefined;
  color?: string | undefined;
  customIcon?: string | undefined;
  customColor?: string | undefined;
  borderWidth?: number | undefined;
  borderColor?: string | undefined;
  borderRadius?: number | undefined;
  backgroundColor?: string | undefined;
  defaultIcon?: ShaIconTypes | undefined;
  textAlign?: CSSProperties['textAlign'] | undefined;
}

export interface IIconPickerComponentProps extends IConfigurableFormComponent, IInputStyles {
  /** Icon rendered when the component has no value. */
  defaultIcon?: ShaIconTypes | undefined;
}

export type IconPickerComponentDefinition = ComponentDefinition<"iconPicker", IIconPickerComponentProps>;
