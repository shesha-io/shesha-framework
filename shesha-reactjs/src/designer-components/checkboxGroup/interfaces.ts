import { CSSProperties, EventHandler } from 'react';
import { DataSourceType, ILabelValue } from '@/designer-components/dropdown/model';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { StringSubtype } from '@/interfaces/utilityTypes';

export const CHECKBOX_GROUP_MODE = ['single', 'multiple'] as const;
export type CheckboxGroupMode = StringSubtype<typeof CHECKBOX_GROUP_MODE>;

export const DIRECTION_TYPE = ['horizontal', 'vertical'] as const;
export type DirectionType = StringSubtype<typeof DIRECTION_TYPE>;

export type CheckboxGroupCommonProps = {
  items?: ILabelValue[] | undefined;
  mode?: CheckboxGroupMode | undefined;
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
  dataSourceUrl?: string | undefined;
  reducerFunc?: string | undefined;
  readOnly?: boolean | undefined;
  enableStyleOnReadonly?: boolean | undefined;
};

export type CheckboxGroupComponentProps = CheckboxGroupCommonProps;

type FocusEventWithValue<TValue = string> = React.FocusEvent<HTMLDivElement, Element> & {
  target: {
    value: TValue | TValue[] | undefined;
  };
};

export type ICheckboxGroupProps<TValue = string> = CheckboxGroupCommonProps & {
  value?: TValue | TValue[] | undefined;
  onChange?: ((checkedValue: TValue | Array<TValue> | null) => void) | undefined;
  onFocus?: EventHandler<FocusEventWithValue<TValue>> | undefined;
  onBlur?: EventHandler<FocusEventWithValue<TValue>> | undefined;
};
