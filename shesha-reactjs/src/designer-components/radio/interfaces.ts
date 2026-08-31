import { RadioChangeEvent, SpaceProps } from 'antd';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties } from 'react';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { ComponentDefinition, IConfigurableFormComponent } from '@/interfaces';
import { IInputStyles, INestedStyleValue } from '@/providers/form/models';

export type DirectionType = 'horizontal' | 'vertical';
export const DIRECTION_TYPE: readonly DirectionType[] = ['horizontal', 'vertical'];

/** The subset of the model that determines which options a radio group displays. */
export interface IRadioOptionsSource {
  items?: ILabelValue[] | undefined;
  referenceListId?: IReferenceListIdentifier | undefined;
  dataSourceType?: DataSourceType | undefined;
  /** Endpoint backing the `url` data source. */
  dataSourceUrl?: string | undefined;
  /** Script mapping the `url` response to `{ label, value }` pairs. */
  reducerFunc?: string | undefined;
}

export interface IRadioProps extends Partial<IRadioOptionsSource> {
  /**
   * Options to render. When supplied they are used as-is; otherwise they are resolved
   * from the data source described by the remaining properties.
   */
  options?: ILabelValue[] | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  direction?: SpaceProps['orientation'] | undefined;
  value?: number | string | undefined;
  onChange?: ((e: RadioChangeEvent) => void) | undefined;
  onBlur?: React.FocusEventHandler<HTMLDivElement> | undefined;
  onFocus?: React.FocusEventHandler<HTMLDivElement> | undefined;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement> | undefined;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement> | undefined;
  onMouseMove?: React.MouseEventHandler<HTMLDivElement> | undefined;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement> | undefined;
  onKeyUp?: React.KeyboardEventHandler<HTMLDivElement> | undefined;
  style?: CSSProperties | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  /** Kept for consumers that have not moved to Interaction Mode yet (e.g. checkbox group). */
  readOnly?: boolean | undefined;
}

// Extends IInputStyles/INestedStyleValue so the wrapper's Appearance style model is typed here,
// with the per-option set under `radio`.
export interface IRadioComponentProps extends IRadioOptionsSource, IConfigurableFormComponent, IInputStyles, INestedStyleValue<'radio'> {
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  direction?: SpaceProps['orientation'] | undefined;
  radio?: IInputStyles;
}

/** Values derived from the model before render — currently the evaluated `url` data source. */
export interface IRadioCalculatedValues {
  dataSourceUrl?: string | undefined;
}

export type RadioComponentDefinition = ComponentDefinition<"radio", IRadioComponentProps, IRadioCalculatedValues>;
