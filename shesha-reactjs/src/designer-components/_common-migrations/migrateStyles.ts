import { addPx } from "../_settings/utils";
import { ITextFieldComponentProps } from "../textField/interfaces";
import { IStyleType } from "@/interfaces";

export const migratePrevStyles = (prev: ITextFieldComponentProps) => {

    const migrateStyles = (screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
        const prevStyles = screen ? prev[screen] : prev;

        return {
            border: {
                hideBorder: prevStyles?.hideBorder,
                border: {
                    all: {
                        width: prevStyles?.borderSize as string || '1px',
                        style: prevStyles.borderType || 'solid',
                        color: prevStyles.borderColor || '#d9d9d9'
                    }
                },
                radius: { all: prevStyles?.borderRadius || 8 },
            },
            background: {
                type: 'color',
                color: prevStyles.backgroundColor || '#fff',
            },
            font: {
                color: prevStyles.fontColor || '#000',
                type: 'Arial',
                align: 'left',
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