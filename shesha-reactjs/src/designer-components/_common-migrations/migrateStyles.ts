import { addPx } from "../_settings/utils";
import { IInputStyles, ITextFieldComponentProps } from "../textField/interfaces";
import { IStyleType } from "@/interfaces";

export const migratePrevStyles = (prev: ITextFieldComponentProps) => {

    const migrateStyles = (screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
        const prevStyles = screen ? prev[screen] : prev;

        return {
            border: {
                hideBorder: prevStyles?.hideBorder,
                border: { all: { width: prevStyles?.borderSize + "" || '1px', style: prevStyles.borderType || 'solid' } },
                radius: { all: prevStyles?.borderRadius || 8 },
            },
            background: {
                ...prevStyles,
                type: 'color',
                color: prevStyles.backgroundColor || '#fff',
            },
            font: {
                color: prevStyles.fontColor || '#000',
                size: prevStyles.fontSize as number || 14
            },
            dimensions: {
                height: addPx(prevStyles.height) || '32px',
                width: addPx(prevStyles.width) || '100%',
            },
        };
    };

    const result: ITextFieldComponentProps = {
        ...prev,
        desktop: migrateStyles('desktop'),
        tablet: migrateStyles('tablet'),
        mobile: migrateStyles('mobile'),
        inputStyles: migrateStyles()
    };

    return result;
}; 