import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
    CSSProperties,
    FC,
    ReactNode,
    useMemo
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
}
export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    const { fontSize, color, readOnly, applicationContext, value, onChange, borderColor, borderRadius, borderWidth, backgroundColor, stylingBox, defaultValue } = props;
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const computedColor = useMemo(() => {
        return color;
    }, [applicationContext, color]);

    const computedBorderColor = useMemo(() => {
        return borderColor;
    }, [applicationContext, color, borderColor]);

    const computedIcon = useMemo(() => {
        return defaultValue;
    }, [applicationContext, defaultValue, value, borderColor]);

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
        if (onChange) onChange(iconName);
    };

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');

    const style: CSSProperties = {
        fontSize: fontSize || 24,
        color: computedColor,
        marginLeft: (borderWidth || borderColor || backgroundColor) ? '12px' : 'none' //this allows us to correct the icon layout when it's configured
    };

    const getIconStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: Number(fontSize) ? `${fontSize}px` : 'auto',
        height: Number(fontSize) ? `${fontSize}px` : 'auto',
        border: `${borderWidth}px solid ${computedBorderColor}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor,
        ...pickStyleFromModel(stylingBoxJSON),
        ...(executeFunction("{}", { data, globalState }) || {})
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