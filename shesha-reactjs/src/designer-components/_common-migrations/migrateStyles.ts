import { addPx } from "../_settings/utils";
import { IConfigurableFormComponent, IInputStyles, IStyleType } from "@/interfaces";

type ExtendedType = IStyleType & IConfigurableFormComponent;

function extractStyle(inputString) {
    if (!inputString) return '';
    const startIndex = inputString.indexOf('{') + 1;
    const endIndex = inputString.indexOf('}');

    return inputString.substring(startIndex, endIndex).trim() + ', ';
};

const getScaleValue = (size: string): string => {
    switch (size) {
        case 'small':
            return 'height: 24, fontSize: 12, padding: "0 8px" ';
        case 'middle':
            return 'height: 32, fontSize: 14, padding: "0 8px" ';
        case 'large':
            return ' height: 40, fontSize: 16, padding: "0 8px" ';
        default:
            return 'height: 32, fontSize: 14, padding: "0 8px" ';
    }
};

export const migratePrevStyles = <T extends ExtendedType>(prev: T) => {


    const migrateStyles = (screen?: 'desktop' | 'tablet' | 'mobile'): IStyleType => {
        const prevStyles: IInputStyles = screen ? prev[`${screen}`] : prev;

        const scale = getScaleValue(prevStyles.size);

        const border = {
            ...prev?.border?.border?.all,
            width: prevStyles?.borderSize as string || prev?.border?.border?.all?.width || '1px',
            style: prevStyles?.borderType || prev?.border?.border?.all?.style || 'solid',
            color: prevStyles?.borderColor || prev?.border?.border?.all?.color || '#d9d9d9'
        };

        return {
            border: {
                ...prev?.border,
                hideBorder: prevStyles?.hideBorder,
                selectedCorner: 'all',
                selectedSide: 'all',
                border: {
                    ...prev?.border?.border,
                    all: border,
                    top: border,
                    bottom: border,
                    left: border,
                    right: border

                },
                radius: { all: prevStyles?.borderRadius || 8 },
            },
            background: {
                ...prev?.background,
                type: prev?.background?.type || 'color',
                color: prevStyles?.backgroundColor || prev?.background?.color,
                repeat: 'no-repeat',
                size: 'cover',
                position: 'center',
                gradient: { direction: 'to right', colors: {} }
            },
            font: {
                ...prev?.font,
                color: prevStyles?.fontColor || prev?.font?.color || '#000',
                type: prev?.font?.type || 'Segoe UI',
                align: prev?.font?.align || 'left',
                size: prevStyles?.fontSize as number || prev?.font?.size,
                weight: prevStyles?.fontWeight as string || prev?.font?.weight,
            },
            dimensions: {
                ...prev?.dimensions,
                width: addPx(prevStyles?.width) || addPx(prev?.dimensions?.width),
                height: addPx(prevStyles?.height) || addPx(prev?.dimensions?.height)
            },
            shadow: {
                ...prev?.shadow,
                offsetX: 0,
                offsetY: 0,
                color: '#000',
                blurRadius: 0,
                spreadRadius: 0
            },
            style: `return { ${extractStyle(prevStyles?.style) !== undefined && (extractStyle(prevStyles?.style))} ${scale} }`,
        };
    };

    const result: T = {
        ...prev,
        desktop: { ...migrateStyles('desktop') },
        tablet: { ...migrateStyles('tablet') },
        mobile: { ...migrateStyles('mobile') },
    };

    return result;

};