import { splitValueAndUnit } from "../_settings/utils";
import { IInputStyles, ITextFieldComponentProps } from "../textField/interfaces";
import { IStyleType } from "@/interfaces";

export const migrateStyles = (prev: ITextFieldComponentProps) => {
    const styles: IInputStyles = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        fontColor: prev.fontColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox
    };

    const migrateStyles = (styles: IInputStyles): IStyleType => ({
        border: {
            hideBorder: styles.hideBorder,
            border: { all: { width: styles.borderSize } },
            radius: { all: styles.borderRadius },
        },
        background: {
            type: 'color',
            color: styles.backgroundColor || '#fff',
        },
        font: {
            color: styles.fontColor || '#000',
            size: styles.fontSize as number || 14,
            weight: styles.fontWeight as number || 400,
        },
        dimensions: {
            height: typeof styles.height === 'string' ? splitValueAndUnit(styles.height) : { value: styles.height, unit: 'px' },
            width: typeof styles.width === 'string' ? splitValueAndUnit(styles.width) : { value: styles.width, unit: 'px' },
        },
    });

    const result: ITextFieldComponentProps = {
        ...prev,
        desktop: migrateStyles(styles),
        tablet: migrateStyles(styles),
        mobile: migrateStyles(styles)
    };


    return result;
}; 