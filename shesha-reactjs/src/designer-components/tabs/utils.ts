import { nanoid } from "@/utils/uuid";
import { ITabPaneProps } from "./models";
import { initializeStyles } from "../_common-migrations/migrateStyles";
import { IStyleType } from "@/index";

export const defaultStyles: IStyleType = {
    border: {
        border: {
            all: {
                width: '0px',
            },
            left: {
                width: '0px',
                color: '#d9d9d9',
                style: 'none',
            },
            right: {
                width: '0px',
                color: '#d9d9d9',
                style: 'none',
            },
            bottom: {
                width: '0px',
                color: '#d9d9d9',
                style: 'none',
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