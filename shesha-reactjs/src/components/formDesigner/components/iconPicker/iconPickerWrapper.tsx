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
}
export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    const { customColor, customIcon, fontSize, color, readOnly, applicationContext, value, onChange } = props;
    const computedColor = useMemo(() => {
        return customColor
        ? executeScriptSync<string>(customColor, applicationContext)
        : color;
    }, [applicationContext, customColor, color]);

    const computedIcon = useMemo(() => {
        if (customIcon) return executeScriptSync<string>(customIcon, applicationContext);

        return value;
    }, [applicationContext, customIcon, value]);

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
        if (onChange) onChange(iconName);
    };

    const style: CSSProperties = {
        fontSize: fontSize || 24,
        color: computedColor,
    };

    return (
        <IconPicker
            value={computedIcon as ShaIconTypes}
            onIconChange={onIconChange}
            readOnly={readOnly}
            style={style}
            twoToneColor={computedColor}
        />
    );
};