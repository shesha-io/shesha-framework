import { addPx } from "../_settings/utils";
import { ITextFieldComponentProps } from "../textField/interfaces";
import { IStyleType } from "@/interfaces";

export const migratePrevStyles = (prev: ITextFieldComponentProps) => {

    const migrateStyles = (screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
        const prevStyles = screen ? prev[screen] : prev;

        return {
            border: {
                hideBorder: prevStyles?.hideBorder,
                selectedCorner: 'all',
                selectedSide: 'all',
                border: {
                    all: {
                        width: prevStyles?.borderSize as string || '1px',
                        style: prevStyles.borderType || 'solid',
                        color: prevStyles.borderColor || '#d9d9d9'
                    }
                },
                radius: { all: prevStyles?.borderRadius || 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            },
            background: {
                type: 'color',
                color: prevStyles.backgroundColor || '#fff',
                repeat: 'no-repeat',
                size: 'cover',
                position: 'center'
            },
            font: {
                color: prevStyles.fontColor || '#000',
                type: 'Arial',
                align: 'left',
                size: prevStyles.fontSize as number || 14,
                weight: prevStyles.fontWeight as string || '400',
            },
            dimensions: {
                height: addPx(prevStyles.height) || '32px',
                width: addPx(prevStyles.width) || '100%',
                minHeight: '0px',
                minWidth: '0px',
                maxWidth: '100%',
                maxHeight: '100%'
            },
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#000',
                blurRadius: 0,
                spreadRadius: 0
            }
        };
    };

    const result: ITextFieldComponentProps = {
        ...prev,
        desktop: { ...prev.desktop, ...migrateStyles('desktop') },
        tablet: { ...prev.tablet, ...migrateStyles('tablet') },
        mobile: { ...prev.mobile, ...migrateStyles('mobile') },
        inputStyles: migrateStyles()
    };

    return result;
}; 