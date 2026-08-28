import { IStyleValue } from "@/providers/form/models";
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { GetRef, Select, SelectProps } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { CSSProperties, Ref } from 'react';

/** Resolves to BaseSelectRef — the imperative handle exposing `focus()`/`blur()`. */
export type DropdownSelectRef = GetRef<typeof Select>;

export type DataSourceType = 'values' | 'referenceList' | 'url';

export interface ILabelValue<TValue = unknown> {
  id: string;
  label: string;
  value: TValue;
  color?: string;
  icon?: string;
  description?: string;
}

/**
 * Legacy value shapes. `simple` stored the raw item value, `listItem` the whole reference-list item
 * and `custom` delegated to user JS. Superseded by `DropdownBindingFormat`, but still read at runtime
 * so forms saved before the rename keep resolving their values.
 */
export type DropdownValueFormat = 'simple' | 'listItem' | 'custom';

/** What gets written to the bound property: the selected item value, or its display text. */
export type DropdownBindingFormat = 'itemValue' | 'itemLabel';

/**
 * How a tag is filled. Mirrors the antd `Tag` variant prop:
 * - `solid` — the option colour fills the tag
 * - `outlined` — a coloured border with a transparent body
 * - `filled` — a soft tint of the option colour, with no border
 */
export type TagVariant = 'solid' | 'outlined' | 'filled';

export interface IDropdownProps {
  dataSourceType: DataSourceType;
  values?: ILabelValue<number | string>[];
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  referenceListId?: IReferenceListIdentifier | undefined;
  value?: number | number[] | string | string[] | (string | number)[] | undefined;
  onChange?: ((value: number | number[] | string | string[] | (string | number)[] | undefined) => void) | undefined;
  hideBorder?: boolean | undefined;
  allowClear?: boolean | undefined;
  mode?: 'single' | 'multiple' | 'tags' | undefined;
  /** Multi-select toggle. Supersedes `mode`, which is still derived from it at runtime. */
  enableMultiSelect?: boolean | undefined;
  tag?: IStyleValue | undefined;
  ignoredValues?: number[] | undefined;
  placeholder?: string | undefined;
  disabledValues?: number[] | undefined;
  disableItemValue?: boolean | undefined;
  /** @deprecated use bindingFormat instead */
  valueFormat?: DropdownValueFormat | undefined;
  /** What the bound property receives: the item value, or the item label. */
  bindingFormat?: DropdownBindingFormat | undefined;
  incomeCustomJs?: string | undefined;
  outcomeCustomJs?: string | undefined;
  labelCustomJs?: string | undefined;
  /** Text shown in read-only mode when there is no selected value. */
  readOnlyPlaceholder?: string | undefined;
  size?: SizeType | undefined;
  style?: React.CSSProperties | undefined;
  tagStyle?: CSSProperties | undefined;
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  displayStyle?: 'text' | 'tags' | undefined;
  showItemName?: boolean | undefined;
  showIcon?: boolean | undefined;
  /** How each tag is filled. */
  tagVariant?: TagVariant;
  enableStyleOnReadonly?: boolean | undefined;
  /** Emotion class emitted from the Appearance settings. Merged with the component's own class. */
  className?: string | undefined;
  /**
   * Emotion class for the option list, which antd portals outside the select and so cannot be
   * reached from `className`. Built by the caller for the same reason (see `className`).
   */
  popupClassName?: string | undefined;
  /** Forwarded to the underlying antd `Select` so callers can expose `focus()` on their API. */
  selectRef?: Ref<DropdownSelectRef | null> | undefined;
  /** Standard DOM event handlers, supplied by `getComponentEvents`. */
  events?: SelectEventHandlers | undefined;
  /**
   * Appearance style model, used only by the read-only renderer. The editable control is styled by
   * the emotion class in `className`, but `ReadOnlyDisplayFormItem` renders outside the select and
   * has no class hook, so it still takes the style model as a value.
   */
  styleValue?: IStyleValue | undefined;
}

/** The subset of antd `Select` props used to relay the standard component events. */
export type SelectEventHandlers = Pick<
  SelectProps,
  'onBlur' | 'onClick' | 'onFocus' | 'onKeyDown' | 'onKeyUp' | 'onMouseEnter' | 'onMouseLeave'
>;
