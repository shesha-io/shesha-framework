import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
    CSSProperties,
    FC,
    ReactNode
} from 'react';
import { IApplicationContext, pickStyleFromModel } from '@/providers/form/utils';
import { executeFunction, useFormData, useGlobalState } from '@/index';

interface IconPickerWrapperProps {
    disabled?: boolean; // todo: move to the model level
    applicationContext: IApplicationContext;
    value: any;
    onChange: (...args: any[]) => void;
    readOnly?: boolean;
    fontSize?: number;
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
    const { fontSize, color, readOnly, onChange, borderColor, borderRadius, borderWidth, backgroundColor, stylingBox, defaultValue, value, textAlign } = props;
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
        if (onChange) onChange(iconName);
    };

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');

    const style: CSSProperties = {
        fontSize: fontSize || 24,
        color: color,
        marginLeft: (defaultValue) ? '12px' : 'none' //this allows us to correct the icon layout when an icon is selected
    };

    const getIconStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: Number(fontSize) ? `${fontSize}px` : '25px',
        height: Number(fontSize) ? `${fontSize}px` : '25px',
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor,
        ...pickStyleFromModel(stylingBoxJSON),
        ...(executeFunction("{}", { data, globalState }) || {})
    };

    return (
        <div style={(defaultValue || value) ? { display: 'grid', placeItems: textAlign, width: '100%' } : {}}>
            <div style={(defaultValue) ? getIconStyle : {}}>
                <IconPicker
                    value={value as ShaIconTypes}
                    onIconChange={onIconChange}
                    readOnly={readOnly}
                    style={style}
                    twoToneColor={color}
                    defaultValue={defaultValue as ShaIconTypes}
                />
            </div>
        </div>
    );
};