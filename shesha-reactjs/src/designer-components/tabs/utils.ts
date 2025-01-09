import { nanoid } from "@/utils/uuid";
import { ITabPaneProps } from "./models";
import { initializeStyles } from "../_common-migrations/migrateStyles";

export const defaultStyles = {

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