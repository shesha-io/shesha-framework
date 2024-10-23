import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
    CSSProperties,
    FC,
    ReactNode
} from 'react';
import { IApplicationContext, pickStyleFromModel } from '@/providers/form/utils';
import { executeFunction, useFormData, useGlobalState } from '@/index';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

interface IconPickerWrapperProps {
    disabled?: boolean; // todo: move to the model level
    applicationContext: IApplicationContext;
    value: any;
    onChange: (...args: any[]) => void;
    readOnly?: boolean;
    fontSize?: number;
    iconSize?: number;
    size?: SizeType;
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
}

export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    const { fontSize, iconSize, color, readOnly, onChange, borderColor, borderRadius, borderWidth, backgroundColor, stylingBox, defaultValue, value } = props;
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
        if (onChange) onChange(iconName);
    };

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');

    const style: CSSProperties = {
        color: color,
        marginLeft: (defaultValue) ? '12px' : 'none' //this allows us to correct the icon layout when an icon is selected
    };

    const getIconStyle = {
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor,
        ...pickStyleFromModel(stylingBoxJSON),
        ...(executeFunction("{}", { data, globalState }) || {})
    };

    return (
        <IconPicker
            fontSize={fontSize}
            iconSize={iconSize}
            selectBtnSize={props.selectBtnSize}
            value={value as ShaIconTypes}
            onIconChange={onIconChange}
            readOnly={readOnly}
            style={{ ...style, ...getIconStyle }}
            twoToneColor={color}
            defaultValue={defaultValue as ShaIconTypes}
        />
    );
};