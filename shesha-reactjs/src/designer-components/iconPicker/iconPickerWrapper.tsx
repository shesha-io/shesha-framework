import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, { CSSProperties, FC, ReactNode, } from 'react';
import { IApplicationContext} from '@/providers/form/utils';
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
    iconSize
  } = props;

  // Define effectiveDefaultValue at the component level
  let effectiveDefaultValue = defaultValue;
  const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
    effectiveDefaultValue = effectiveDefaultValue ?? iconName; // Set effectiveDefaultValue if it is not already set

    if (onChange) onChange(iconName);
  };


  const fontSize = parseFloat(String(fullStyles?.fontSize).replace('px', ''));

  const style: CSSProperties = {
    fontSize: fullStyles?.fontSize || 24,
    color: fullStyles?.color,
    marginLeft: defaultValue ? '12px' : 'none',
  };


  return (
    <div style={effectiveDefaultValue ? { display: 'grid', placeItems: textAlign, width: '100%' } : {}}>
      <Tooltip title={props?.description}>
        <div
          style={{
            marginLeft: props.value === undefined && props.defaultValue === undefined ? '38px' : '',
            ...fullStyles,
          }}
        >
          <IconPicker
            value={effectiveDefaultValue as ShaIconTypes}
            defaultValue={effectiveDefaultValue as ShaIconTypes}
            onIconChange={onIconChange}
            selectBtnSize={selectBtnSize}
            iconSize={
              iconSize ?? fontSize
            }
            readOnly={readOnly}
            style={style}
            color={props.color}
            twoToneColor={color}
          />
        </div>
      </Tooltip>
    </div>
  );
};
