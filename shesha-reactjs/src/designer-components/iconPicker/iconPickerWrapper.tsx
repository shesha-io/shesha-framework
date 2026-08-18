import IconPicker, { IIconPickerProps, ShaIconTypes } from '@/components/iconPicker';
import { FC, useCallback } from 'react';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { Tooltip } from 'antd';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';

interface IconPickerWrapperProps {
  /** Greys the picker out and takes it out of the tab order. Independent of `readOnly`. */
  disabled?: boolean | undefined;
  /** Renders the icon but blocks selection. Independent of `disabled`. */
  readOnly?: boolean | undefined;
  value: string | null | undefined;
  onChange: ((newValue: string | null) => void) | undefined;
  selectBtnSize?: SizeType | undefined;
  defaultValue?: ShaIconTypes | undefined;
  description?: string | undefined;
  /**
   * Explicit glyph size in px. Used by the settings-form `iconPicker` input, which sizes the glyph
   * directly rather than through a style model. The form component leaves this unset and sizes the
   * glyph from the Font panel via `className` instead.
   */
  iconSize?: number | undefined;
  /** Emotion class carrying the configured appearance. */
  className?: string | undefined;
}

export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
  const {
    disabled,
    readOnly,
    onChange,
    selectBtnSize,
    value,
    defaultValue,
    description,
    iconSize,
    className,
  } = props;

  const onIconChange = useCallback<Required<IIconPickerProps>["onIconChange"]>((_icon, iconName): void => {
    if (onChange) onChange(iconName);
  }, [onChange]);

  // Both non-editable modes must block selection. `IconPicker` gates the modal on `readOnly`
  // alone, so Disabled has to be folded in here or a disabled picker would still open its modal.
  const selectionBlocked = readOnly === true || disabled === true;

  const picker = (
    <IconPicker
      value={value ?? defaultValue ?? undefined}
      onIconChange={onIconChange}
      selectBtnSize={selectBtnSize}
      readOnly={selectionBlocked}
      {...(isDefined(iconSize) ? { iconSize } : {})}
      // The class goes to IconPicker itself rather than to a wrapping div: it lands on the
      // picker root, so the configured box applies to the picker and the class's descendant
      // rules can reach the glyph. No inline style beyond the evaluated Custom style, which
      // keeps the cascade open for form- and theme-level overrides.
      className={className}
    />
  );

  return isNotNullOrWhiteSpace(description)
    ? <Tooltip title={description}>{picker}</Tooltip>
    : picker;
};
