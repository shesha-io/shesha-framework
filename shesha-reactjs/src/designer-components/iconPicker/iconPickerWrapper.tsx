import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
    CSSProperties,
    FC,
    ReactNode,
    useMemo
    } from 'react';
import { executeScriptSync, IApplicationContext } from '@/providers/form/utils';

interface IconPickerWrapperProps {
    disabled?: boolean; // todo: move to the model level
    applicationContext: IApplicationContext;
    value: any;
    onChange: (...args: any[]) => void;
    readOnly?: boolean;
    fontSize?: number;
    color?: string;
    customIcon?: string;
    customColor?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    backgroundColor?: string;
}
export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    const { customColor, customIcon, fontSize, color, readOnly, applicationContext, value, onChange, borderColor, borderRadius, borderWidth, backgroundColor } = props;
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
        if (customIcon) return executeScriptSync<string>(customIcon, applicationContext);

        return value;
    }, [applicationContext, customIcon, value, borderColor]);

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
        if (onChange) onChange(iconName);
    };

    const style: CSSProperties = {
        fontSize: fontSize || 24,
        color: computedColor,
        width: '100%',
        height: '100%',
        zIndex: 1,
        marginLeft: '12px'
        //backgroundColor: computedBorderColor
    };

    console.log(borderWidth, computedBorderColor)

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            width: fontSize+'px',
            height: fontSize+'px',
            border: `${borderWidth}px solid ${computedBorderColor}`,
            borderRadius: borderRadius+'px',
            boxSizing: 'border-box', 
            zIndex: 2,
            padding: `${borderWidth + 23}px ${borderWidth}px`
        }}>
        <div>
        <IconPicker
            value={computedIcon as ShaIconTypes}
            onIconChange={onIconChange}
            readOnly={readOnly}
            style={style}
            twoToneColor={computedColor}
        />
        </div>
        </div>
    );
};