import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
    CSSProperties,
    FC,
    ReactNode,
    useMemo
    } from 'react';
import { executeScriptSync, IApplicationContext, pickStyleFromModel } from '@/providers/form/utils';

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
    stylingBox?: string;
    defaultValue?: ShaIconTypes;
}
export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    console.log(props, "ICON PICKER WRAPPER PROPS")
    const { customColor, customIcon, fontSize, color, readOnly, applicationContext, value, onChange, borderColor, borderRadius, borderWidth, backgroundColor, stylingBox, defaultValue } = props;

    console.log(defaultValue, "DEFAULT ICON X3")
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

    const stylingBoxJSON = useMemo(()=>{
        return pickStyleFromModel(JSON.parse(stylingBox || "{}"));
    },[stylingBox]);

    const style: CSSProperties = {
        fontSize: fontSize || 24,
        color: computedColor,
        zIndex: 1,
        marginLeft: '12px'
    };

    return (
        <div style={{
            boxSizing: 'border-box', 
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: '.3s',
            width: fontSize+'px',
            height: fontSize+'px',
            border: `${borderWidth}px solid ${computedBorderColor}`,
            borderRadius: borderRadius+'px',
            padding: `${stylingBoxJSON["paddingTop"]} ${stylingBoxJSON["paddingRight"]} ${stylingBoxJSON["paddingBottom"]} ${stylingBoxJSON["paddingLeft"]}`,
            margin: `${stylingBoxJSON["marginTop"]} ${stylingBoxJSON["marginRight"]} ${stylingBoxJSON["marginBottom"]} ${stylingBoxJSON["marginLeft"]}`,
            backgroundColor: backgroundColor
        }}>
        <div>
        <IconPicker
            value={computedIcon as ShaIconTypes}
            onIconChange={onIconChange}
            readOnly={readOnly}
            style={style}
            twoToneColor={computedColor}
            defaultValue={defaultValue as ShaIconTypes}
        />
        </div>
        </div>
    );
};