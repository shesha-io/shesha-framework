import { nanoid } from "@/utils/uuid";
import { ITabPaneProps } from "./models";
import { IStyleType } from "@/index";

const initialBorder: IStyleType['border']['border']['all'] = { width: '1px', color: '#f0f0f0', style: 'solid' };

export const defaultStyles: IStyleType = {
    font: {
        size: 14,
        weight: '500',
        type: 'Segoe UI',
        color: ''
    },
    background: { type: 'color', color: '#FFFFFF' },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: {
        border: {
            all: initialBorder, top: initialBorder, right: initialBorder,
            bottom: initialBorder, left: initialBorder
        },
        radius: { all: 8, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
        radiusType: 'all',
        borderType: 'all'
    },
    shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
    stylingBox: "{\"marginBottom\":\"5\",\"paddingLeft\":\"16\",\"paddingBottom\":\"16\",\"paddingTop\":\"16\",\"paddingRight\":\"16\"}",
};

export const defaultCardStyles: IStyleType = {
    font: {
        size: 14,
        weight: '400',
        type: 'Segoe UI',
        color: 'var(--primary-color)'
    },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    background: { type: 'color', color: 'rgba(0,0,0,0.02)', repeat: 'repeat', size: 'cover', position: 'center' },
};

export const onAddNewItem = (items) => {
    const count = (items ?? []).length;
    const id = nanoid();
    const buttonProps: ITabPaneProps = {
        id: id,
        name: `Tab${count + 1}`,
        key: id,
        title: `Tab ${count + 1}`,
        editMode: 'inherited',
        selectMode: 'editable',
        components: []
    };

    return buttonProps;
};