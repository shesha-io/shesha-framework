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
    additionalStyles?: CSSProperties;
}

export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    const { fontSize, color, readOnly, onChange, borderColor, borderRadius, borderWidth, backgroundColor, stylingBox, defaultValue, textAlign
        , selectBtnSize, iconSize, additionalStyles
    } = props;
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
        if (onChange) onChange(iconName);
    };

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');

    const style: CSSProperties = {
        ...additionalStyles,
        fontSize: fontSize || 24,
        color: color,
        marginLeft: (defaultValue) ? '12px' : 'none' //this allows us to correct the icon layout when an icon is selected
    };

    const getIconStyle = {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: Number(fontSize) ? `${fontSize}px` : 'auto',
        height: Number(fontSize) ? `${fontSize}px` : 'auto',
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor,
        ...pickStyleFromModel(stylingBoxJSON),
        ...(executeFunction("{}", { data, globalState }) || {})
    };


    return (
        <div style={(defaultValue) ? { display: 'grid', placeItems: textAlign, width: '100%' } : {}}>
            <div style={(defaultValue) ? getIconStyle : {}}>
                <IconPicker
                    value={defaultValue as ShaIconTypes}
                    onIconChange={onIconChange}
                    selectBtnSize={selectBtnSize}
                    iconSize={iconSize}
                    readOnly={readOnly}
                    style={style}
                    twoToneColor={color}
                    defaultValue={defaultValue as ShaIconTypes}
                />
            </div>
        </div>
    );
};