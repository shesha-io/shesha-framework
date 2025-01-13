import { nanoid } from "@/utils/uuid";
import { ITabPaneProps } from "./models";
import { initializeStyles } from "../_common-migrations/migrateStyles";
import { IStyleType } from "@/index";

export const defaultStyles: IStyleType = {

    background: { type: 'color', color: '#FFFFFF' },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: {
        border: {
            all: { width: '1px', color: '#f0f0f0', style: 'solid' }, top: { width: '1' }, right: { width: '1' },
            bottom: { width: '1' }, left: { width: '1' }
        },
        radius: { all: 8 },
        selectedCorner: 'all',
        selectedSide: 'all'
    },
    shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
};

export const defaultCardStyles = {

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
        components: [],
        ...initializeStyles({ id, type: '' })
    };

    return buttonProps;
};