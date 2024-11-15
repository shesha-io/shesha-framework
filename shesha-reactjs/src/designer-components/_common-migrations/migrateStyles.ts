import { addPx } from "../_settings/utils";
import { IInputStyles, ITextFieldComponentProps } from "../textField/interfaces";
import { IStyleType } from "@/interfaces";

export const migratePrevStyles = (prev: ITextFieldComponentProps) => {

    const migrateStyles = (screen: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
        const prevStyles = prev[screen] as IInputStyles;

        return {
            border: {
                hideBorder: prevStyles?.hideBorder,
                border: { all: { width: prevStyles?.borderSize + "" } },
                radius: { all: prevStyles?.borderRadius },
            },
            background: {
                type: 'color',
                color: prevStyles.backgroundColor || '#fff',
            },
            font: {
                color: prevStyles.fontColor || '#000',
                size: prevStyles.fontSize as number || 14,
                weight: prevStyles.fontWeight as number || 400,
            },
            dimensions: {
                height: addPx(prevStyles.height),
                width: addPx(prevStyles.width),
            },
        }
    };

    console.log("desktop:", migrateStyles('desktop'),
        "tablet:", migrateStyles('tablet'),
        "mobile:", migrateStyles('mobile'))

    const result: ITextFieldComponentProps = {
        ...prev,
        desktop: migrateStyles('desktop'),
        tablet: migrateStyles('tablet'),
        mobile: migrateStyles('mobile')
    };

    console.log("result:", result)

    return result;
}; 