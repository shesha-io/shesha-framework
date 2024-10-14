import { ItemInterface } from "react-sortablejs";

export type ListMode = 'create' | 'read' | 'update';

export interface ListItem {
    
}

export interface ListItemWithId extends ListItem {
    id: string;
}

export interface SortableItem<ListItemType> extends ItemInterface {
    data: ListItemType;
}