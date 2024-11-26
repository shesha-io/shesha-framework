import { addPx } from "../_settings/utils";
import { IConfigurableFormComponent, IStyleType } from "@/interfaces";

export const migratePrevStyles = <T extends IConfigurableFormComponent>(prev: T) => {

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
                        style: prevStyles?.borderType || 'solid',
                        color: prevStyles?.borderColor || '#d9d9d9'
                    },
                    top: {
                        width: prevStyles?.borderSize as string || '1px',
                        style: prevStyles?.borderType || 'solid',
                        color: prevStyles?.borderColor || '#d9d9d9'
                    },
                    bottom: {
                        width: prevStyles?.borderSize as string || '1px',
                        style: prevStyles?.borderType || 'solid',
                        color: prevStyles?.borderColor || '#d9d9d9'
                    },
                    left: {
                        width: prevStyles?.borderSize as string || '1px',
                        style: prevStyles?.borderType || 'solid',
                        color: prevStyles?.borderColor || '#d9d9d9'
                    },
                    right: {
                        width: prevStyles?.borderSize as string || '1px',
                        style: prevStyles?.borderType || 'solid',
                        color: prevStyles?.borderColor || '#d9d9d9'
                    }

                },
                radius: { all: prevStyles?.borderRadius || 8 },
            },
            background: {
                type: 'color',
                color: prevStyles?.backgroundColor,
                repeat: 'no-repeat',
                size: 'cover',
                position: 'center',
                gradient: { direction: 'to right', colors: {} }
            },
            font: {
                color: prevStyles?.fontColor || '#000',
                type: 'Arial',
                align: 'left',
                size: prevStyles?.fontSize as number || 14,
                weight: prevStyles?.fontWeight as string || '400',
            },
            dimensions: {
                height: addPx(prevStyles?.height) || '32px',
                width: addPx(prevStyles?.width) || '100%',
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

    const result: T = {
        ...prev,
        desktop: { ...migrateStyles('desktop') },
        tablet: { ...migrateStyles('tablet') },
        mobile: { ...migrateStyles('mobile') },
    };

    return result;

}; 