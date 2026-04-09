import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, { CSSProperties, FC, ReactNode, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { IApplicationContext } from '@/providers/form/utils';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IDimensionsValue } from '../_settings/utils/dimensions/interfaces';
import { Tooltip } from 'antd';

interface IconPickerWrapperProps {
  disabled?: boolean; // todo: move to the model level
  applicationContext: IApplicationContext;
  value: any;
  onChange: (...args: any[]) => void;
  readOnly?: boolean;
  fontSize?: number;
  iconSize?: number;
  selectBtnSize?: SizeType;
  color?: string;
  customColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  stylingBox?: string;
  defaultValue?: ShaIconTypes;
  textAlign?: string;
  style?: string;
  dimensions?: IDimensionsValue;
  description?: string;
  fullStyles?: CSSProperties;
}

export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
  const {
    color,
    readOnly,
    onChange,
    defaultValue,
    textAlign,
    selectBtnSize,
    fullStyles,
    iconSize,
    value,
  } = props;

  const [finalValue, setFinalValue] = useState(null);
  const hasSaved = useRef(false);


  const onIconChange = useCallback((_icon: ReactNode, iconName: ShaIconTypes): void => {
    if (onChange) onChange(iconName);
  }, [onChange]);

  const fontSize = parseFloat(String(fullStyles?.fontSize).replace('px', ''));

  const style: CSSProperties = useMemo(() => ({
    ...fullStyles,
    fontSize: fullStyles?.fontSize || 24,
    background: 'transparent',
  }), [fullStyles]);


  useEffect(() => {
    if (value && !hasSaved.current) {
      setFinalValue(value);
      hasSaved.current = true;
    }
  }, [value]);

  const iconValue = finalValue ?? defaultValue;

  return (
    <Tooltip title={props?.description}>
      <div style={(defaultValue || value) ? { display: 'grid', placeItems: textAlign } : {}}>
        <IconPicker
          value={iconValue as ShaIconTypes}
          defaultValue={iconValue as ShaIconTypes}
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
