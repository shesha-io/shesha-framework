import { nanoid } from "@/utils/uuid";
import { ITabPaneProps } from "./models";
import { initializeStyles } from "../_common-migrations/migrateStyles";
import { IStyleType } from "@/index";

export const defaultStyles: IStyleType = {
    border: {
        border: {
            all: {
                width: '1px',
                color: '#d9d9d9',
                style: 'solid',
            },
            left: {
                width: '1px',
                color: '#d9d9d9',
                style: 'solid',
            },
            right: {
                width: '1px',
                color: '#d9d9d9',
                style: 'solid',
            },
            bottom: {
                width: '1px',
                color: '#d9d9d9',
                style: 'solid',
            },
            top: {
                width: '1px',
                color: '#d9d9d9',
                style: 'solid',
            },
        }
    }
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