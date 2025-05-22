import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, { CSSProperties, FC, ReactNode, useMemo } from 'react';
import { IApplicationContext, pickStyleFromModel } from '@/providers/form/utils';
import { executeFunction, getStyle, useFormData, useGlobalState } from '@/index';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
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
    fontSize,
    color,
    readOnly,
    onChange,
    borderColor,
    borderRadius,
    borderWidth,
    backgroundColor,
    stylingBox,
    defaultValue,
    textAlign,
    selectBtnSize,
    dimensions,
    fullStyles,
  } = props;
  const { data } = useFormData();
  const { globalState } = useGlobalState();

  const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);

  const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
    if (onChange) onChange(iconName);
  };

  const stylingBoxJSON = JSON.parse(stylingBox || '{}');

  console.log('stylingBoxJSON', fullStyles);

  const style: CSSProperties = {
    fontSize: fullStyles?.fontSize || 24,
    color: fullStyles?.color,
    marginLeft: defaultValue ? '12px' : 'none', //this allows us to correct the icon layout when an icon is selected
  };

  console.log('style', style);

  //   const getIconStyle = {
  //     display: 'flex',
  //     flexDirection: 'row',
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     color: color,
  //     border: `${fullStyles?.borderWidth} solid ${fullStyles?.borderColor}`,
  //     width: '30px',
  //     height: '24px',
  //     borderRadius: `${fullStyles?.borderRadius}`,
  //     backgroundColor: fullStyles?.backgroundColor,
  //     ...pickStyleFromModel(stylingBoxJSON),
  //     ...dimensionsStyles,
  //     ...getStyle(props.style),
  //     ...(executeFunction('{}', { data, globalState }) || {}),
  //   };

  return (
    <div style={defaultValue ? { display: 'grid', placeItems: textAlign, width: '100%' } : {}}>
      <Tooltip title={props?.description}>
        <div
          style={{
            ...fullStyles,
            marginLeft: props.value === undefined && props.defaultValue === undefined ? '38px' : '',
          }}
        >
          <IconPicker
            value={defaultValue as ShaIconTypes}
            defaultValue={defaultValue as ShaIconTypes}
            onIconChange={onIconChange}
            selectBtnSize={selectBtnSize}
            iconSize={typeof fullStyles?.fontSize === 'number' ? fullStyles.fontSize : 24}
            readOnly={readOnly}
            style={style}
            color={fullStyles?.color}
            twoToneColor={fullStyles?.color}
          />
        </div>
      </Tooltip>
    </div>
  );
};
