import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
    CSSProperties,
    FC,
    ReactNode,
    useMemo,
    useEffect
    } from 'react';
import { executeScriptSync, IApplicationContext, pickStyleFromModel } from '@/providers/form/utils';
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
}
export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    const { customColor, fontSize, color, readOnly, applicationContext, value, onChange, borderColor, borderRadius, borderWidth, backgroundColor, stylingBox, defaultValue } = props;
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const computedColor = useMemo(() => {
        return customColor
        ? executeScriptSync<string>(customColor, applicationContext)
        : color;
    }, [applicationContext, customColor, color]);

    const computedBorderColor = useMemo(() => {
        return customColor
        ? executeScriptSync<string>(customColor, applicationContext)
        : borderColor;
    }, [applicationContext, customColor, borderColor]);

    const computedIcon = useMemo(() => {
        if (defaultValue) return executeScriptSync<string>(defaultValue, applicationContext);
        return value;
    }, [applicationContext, defaultValue, value, borderColor]);

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
        if (onChange) onChange(iconName);
    };

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');

    const style: CSSProperties = {
        fontSize: fontSize,
        color: computedColor,
        marginLeft: '12px'
    };

    const getIconStyle = {
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: Number(fontSize) ? `${fontSize}px` : '24px',
        height: Number(fontSize) ? `${fontSize}px` : '24px',
        border: `${borderWidth}px solid ${computedBorderColor}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor,
        ...pickStyleFromModel(stylingBoxJSON),
        ...(executeFunction("{}", { data, globalState }) || {}),
    };

    return (
        <div style={(computedIcon || defaultValue) ? getIconStyle : {}}>
        <IconPicker
            value={computedIcon as ShaIconTypes || defaultValue as ShaIconTypes}
            onIconChange={onIconChange}
            readOnly={readOnly}
            style={style}
            twoToneColor={computedColor}
            defaultValue={defaultValue as ShaIconTypes}
        />
        </div>
    );
};