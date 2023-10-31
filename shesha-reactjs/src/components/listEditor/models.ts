import { ItemInterface } from "react-sortablejs";

export type ListMode = 'create' | 'read' | 'update';

export interface ListItem {
    
}

export interface SortableItem<ListItemType> extends ItemInterface {
    data: ListItemType;
}