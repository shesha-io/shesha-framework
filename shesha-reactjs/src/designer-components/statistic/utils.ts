import { IStyleType } from '@/index';

export const defaultStyles = (): {} extends IStyleType | null ? any : any => {
    return {
        background: { type: 'color', color: '#fff' },
        titleFont: { weight: '500', size: 20, color: '#000', type: 'Segoe UI', align: 'center' },
        valueFont: { weight: '500', size: 35, color: '#000', type: 'Segoe UI', align: 'center' },
        border: {
            hideBorder: false,
            radiusType: 'all',
            borderType: 'all',
            border: {
                all: { width: '1px', style: 'solid', color: '#d9d9d9' },
                top: { width: '1px', style: 'solid', color: '#d9d9d9' },
                bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
                left: { width: '1px', style: 'solid', color: '#d9d9d9' },
                right: { width: '1px', style: 'solid', color: '#d9d9d9' },
            },
            radius: { all: 8 },
        },
        dimensions: {
            width: '100%',
            height: 'auto',
            minHeight: '0px',
            maxHeight: 'auto',
            minWidth: '0px',
            maxWidth: 'auto',
        },
        style: { padding: '0px', margin: '0px auto', verticalAlign: 'middle', textAlign: 'center' },
        shadow: {
            color: '#96aab480',
            offsetX: 0,
            offsetY: 7,
            blurRadius: 30,
            spreadRadius: -10,
        },
    };
};

export const getDesignerDefaultContent = (model: any) => {
    return {
        ...model,
        title: model.title,
        value: model.value || 1234,
        prefix: model.prefix || 'R',
        suffix: model.suffix,
        prefixIcon: model.prefixIcon,
        suffixIcon: model.suffixIcon,
        precision: model.precision,
    };
};
