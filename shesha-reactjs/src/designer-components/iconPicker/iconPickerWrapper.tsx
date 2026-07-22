import IconPicker, { IIconPickerProps } from '@/components/iconPicker';
import React, { CSSProperties, FC, useCallback, useMemo } from 'react';
import { IApplicationContext } from '@/providers/form/utils';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IDimensionsValue } from '../_settings/utils/dimensions/interfaces';
import { Tooltip } from 'antd';
import { isNullOrWhiteSpace } from '@/utils/nullables';

interface IconPickerWrapperProps {
  disabled?: boolean | undefined; // todo: move to the model level
  applicationContext: IApplicationContext;
  value: string | null | undefined;
  onChange: ((newValue: string | null) => void) | undefined;
  readOnly?: boolean | undefined;
  fontSize?: number | undefined;
  iconSize?: number | undefined;
  selectBtnSize?: SizeType | undefined;
  color?: string | undefined;
  customColor?: string | undefined;
  borderWidth?: number | undefined;
  borderColor?: string | undefined;
  borderRadius?: number | undefined;
  backgroundColor?: string | undefined;
  stylingBox?: string | undefined;
  textAlign?: string | undefined;
  style?: string | undefined;
  dimensions?: IDimensionsValue | undefined;
  description?: string | undefined;
  fullStyles?: CSSProperties | undefined;
}

export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
  const {
    color,
    readOnly,
    onChange,
    textAlign,
    selectBtnSize,
    fullStyles,
    iconSize,
    value,
  } = props;

  const onIconChange = useCallback<Required<IIconPickerProps>["onIconChange"]>((_icon, iconName): void => {
    if (onChange) onChange(iconName);
  }, [onChange]);

  const fontSize = parseFloat(String(fullStyles?.fontSize).replace('px', ''));

  const style: CSSProperties = useMemo(() => ({
    ...fullStyles,
    fontSize: fullStyles?.fontSize ?? 24,
    background: 'transparent',
  }), [fullStyles]);

  return (
    <Tooltip title={props.description}>
      <div style={!isNullOrWhiteSpace(value) ? { display: 'grid', placeItems: textAlign } : {}}>
        <IconPicker
          value={value ?? undefined}
          onIconChange={onIconChange}
          selectBtnSize={selectBtnSize}
          iconSize={iconSize ?? fontSize}
          readOnly={readOnly}
          style={style}
          color={color}
          twoToneColor={color}
        />
      </div>
    </Tooltip>
  );
};
