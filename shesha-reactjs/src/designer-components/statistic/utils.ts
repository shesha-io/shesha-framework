import { IStyleType } from "@/index";

export const defaultStyles = (): {} extends IStyleType | null ? any : any => {
    return {
        background: { type: 'color', color: '#fff' },
        titleFont: { weight: '500', size: 35, color: '#000', type: 'Segoe UI' },
        valueFont: { weight: '500', size: 50, color: '#000', type: 'Segoe UI' },
        border: {
            hideBorder: false,
            radiusType: 'all',
            borderType: 'all',
            border: {
                all: { width: '1px', style: 'solid', color: '#d9d9d9' },
                top: { width: '1px', style: 'solid', color: '#d9d9d9' },
                bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
                left: { width: '1px', style: 'solid', color: '#d9d9d9' },
                right: { width: '1px', style: 'solid', color: '#d9d9d9' }
            },
            radius: { all: 8 }
        },
        dimensions: {},
        style: { padding: '0px', margin: '0px', verticalAlign: "middle", textAlign: "center" },
    };
};