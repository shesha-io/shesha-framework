import { ItemInterface } from "react-sortablejs";

export type ListMode = 'create' | 'read' | 'update';

export interface ListItem {
    itemType?: 'item' | 'group';
    itemSubType?: 'button' | 'item' | 'divider';
}

export interface ListItemWithId extends ListItem {
    childItems?: ListItemWithId[];
    id: string;
}

export interface SortableItem<ListItemType> extends ItemInterface {
    data: ListItemType;
}