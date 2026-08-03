import { CheckboxOptionType } from 'antd';
import { CSSProperties, EventHandler, KeyboardEventHandler, MouseEventHandler, RefObject } from 'react';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { StringSubtype } from '@/interfaces/utilityTypes';
import { IInputStyles, INestedStyleValue } from '@/providers/form/models';

export const DIRECTION_TYPE = ['horizontal', 'vertical'] as const;
export type DirectionType = StringSubtype<typeof DIRECTION_TYPE>;

/** Imperative handle exposed by the group so the component API can focus it. */
export interface CheckboxGroupFocusHandle {
  focus: () => void;
}

// Extends IInputStyles so the Appearance style model (font, dimensions, border,
// background, shadow, stylingBox) is typed and available to styles.ts.
export type CheckboxGroupCommonProps = IInputStyles & INestedStyleValue<'checkbox'> & {
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
  /** JS expression returning the URL to fetch options from (used when `dataSourceType` is `url`). */
  dataSourceUrl?: string | undefined;
  /** The function that receives data from the API and returns it in the format { value, label } */
  reducerFunc?: string | undefined;
  direction?: DirectionType | undefined;
  style?: CSSProperties | undefined;
  styleJson?: CSSProperties | undefined;
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  enableStyleOnReadonly?: boolean | undefined;
};

export type CheckboxGroupComponentProps = CheckboxGroupCommonProps;

type FocusEventWithValue<TValue = string> = React.FocusEvent<HTMLDivElement, Element> & {
  target: {
    value: TValue | TValue[] | undefined;
  };
};

export type ICheckboxGroupProps<TValue = string> = CheckboxGroupCommonProps & {
  /**
   * Options to render. When supplied they are used as-is; otherwise they are resolved
   * from the data source described by the remaining properties.
   */
  options?: CheckboxOptionType[] | undefined;
  value?: TValue | TValue[] | undefined;
  onChange?: ((checkedValue: TValue | Array<TValue> | undefined) => void) | undefined;
  onFocus?: EventHandler<FocusEventWithValue<TValue>> | undefined;
  onBlur?: EventHandler<FocusEventWithValue<TValue>> | undefined;
  /**
   * Pointer/keyboard handlers supplied by `getComponentEvents`. The group has no
   * single input element, so these are applied to the wrapper element.
   */
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
  onMouseEnter?: MouseEventHandler<HTMLDivElement> | undefined;
  onMouseMove?: MouseEventHandler<HTMLDivElement> | undefined;
  onMouseLeave?: MouseEventHandler<HTMLDivElement> | undefined;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement> | undefined;
  onKeyUp?: KeyboardEventHandler<HTMLDivElement> | undefined;
  /** Imperative handle backing the component API's `focus()` — the group has no single input element. */
  focusRef?: RefObject<CheckboxGroupFocusHandle | null> | undefined;
};
