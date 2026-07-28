import { CSSProperties, EventHandler } from 'react';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { StringSubtype } from '@/interfaces/utilityTypes';
import { IInputStyles } from '@/providers/form/models';

export const DIRECTION_TYPE = ['horizontal', 'vertical'] as const;
export type DirectionType = StringSubtype<typeof DIRECTION_TYPE>;

// Extends IInputStyles so the Appearance style model (font, dimensions, border,
// background, shadow, stylingBox) is typed and available to styles.ts.
export type CheckboxGroupCommonProps = IInputStyles & {
  items?: ILabelValue[] | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string | undefined;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  referenceListId?: IReferenceListIdentifier | undefined;
  dataSourceType: DataSourceType;
  direction?: DirectionType | undefined;
  style?: CSSProperties | undefined;
  styleJson?: CSSProperties | undefined;
  dataSourceUrl?: string | undefined;
  reducerFunc?: string | undefined;
  readOnly?: boolean | undefined;
};

export type CheckboxGroupComponentProps = CheckboxGroupCommonProps;

type FocusEventWithValue<TValue = string> = React.FocusEvent<HTMLDivElement, Element> & {
  target: {
    value: TValue | TValue[] | undefined;
  };
};

export type ICheckboxGroupProps<TValue = string> = CheckboxGroupCommonProps & {
  value?: TValue | TValue[] | undefined;
  onChange?: ((checkedValue: TValue | Array<TValue> | undefined) => void) | undefined;
  onFocus?: EventHandler<FocusEventWithValue<TValue>> | undefined;
  onBlur?: EventHandler<FocusEventWithValue<TValue>> | undefined;
};
